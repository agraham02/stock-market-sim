import logging
from datetime import date, datetime, timedelta, timezone
from typing import TypedDict

import httpx
import yfinance as yf
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.quote_cache import QuoteCache

logger = logging.getLogger(__name__)


class Candle(TypedDict):
    time: str  # ISO date, YYYY-MM-DD
    open: float
    high: float
    low: float
    close: float
    volume: float


class SymbolNotFoundError(Exception):
    pass


def _from_tradier(symbol: str, days: int) -> list[Candle] | None:
    settings = get_settings()
    if not settings.tradier_access_token:
        return None

    start = (date.today() - timedelta(days=days)).isoformat()
    end = date.today().isoformat()

    try:
        resp = httpx.get(
            f"{settings.tradier_api_base}/markets/history",
            params={"symbol": symbol, "interval": "daily", "start": start, "end": end},
            headers={
                "Authorization": f"Bearer {settings.tradier_access_token}",
                "Accept": "application/json",
            },
            timeout=10,
        )
        resp.raise_for_status()
        history = resp.json().get("history")
        if not history or history == "null":
            return None

        day = history["day"]
        rows = day if isinstance(day, list) else [day]
        return [
            {
                "time": row["date"],
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": float(row.get("volume", 0)),
            }
            for row in rows
        ]
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Tradier history fetch failed for %s: %s", symbol, exc)
        return None


def _from_yfinance(symbol: str, days: int) -> list[Candle]:
    start = date.today() - timedelta(days=days)
    df = yf.Ticker(symbol).history(start=start, interval="1d")
    if df.empty:
        raise SymbolNotFoundError(f"No OHLC data found for symbol '{symbol}'")

    df = df.reset_index()
    date_col = "Date" if "Date" in df.columns else "Datetime"
    return [
        {
            "time": row[date_col].strftime("%Y-%m-%d"),
            "open": round(float(row["Open"]), 4),
            "high": round(float(row["High"]), 4),
            "low": round(float(row["Low"]), 4),
            "close": round(float(row["Close"]), 4),
            "volume": float(row["Volume"]),
        }
        for _, row in df.iterrows()
    ]


def _fetch_fresh(symbol: str, days: int) -> list[Candle]:
    """Tradier sandbox first (real brokerage data), yfinance as fallback."""
    candles = _from_tradier(symbol, days)
    if candles:
        return candles
    return _from_yfinance(symbol, days)


def get_ohlc(db: Session, symbol: str, days: int = 180, cache_ttl_minutes: int = 15) -> list[Candle]:
    """Fetch daily OHLC candles, serving from QuoteCache when fresh enough."""
    symbol = symbol.upper()
    cached = db.get(QuoteCache, symbol)

    if cached is not None:
        age = datetime.now(timezone.utc) - cached.fetched_at
        if age < timedelta(minutes=cache_ttl_minutes):
            return cached.ohlc_json

    candles = _fetch_fresh(symbol, days)

    if cached is None:
        cached = QuoteCache(symbol=symbol, ohlc_json=candles)
        db.add(cached)
    else:
        cached.ohlc_json = candles
        cached.fetched_at = datetime.now(timezone.utc)

    db.commit()
    return candles
