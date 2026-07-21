import logging
from typing import TypedDict

import httpx
import yfinance as yf

from app.core.config import get_settings
from app.services.market_data import SymbolNotFoundError

logger = logging.getLogger(__name__)


class OptionContract(TypedDict):
    strike: float
    bid: float
    ask: float
    last: float
    volume: int
    open_interest: int
    implied_volatility: float | None
    in_the_money: bool


class OptionChain(TypedDict):
    expiration: str
    calls: list[OptionContract]
    puts: list[OptionContract]


def _expirations_from_tradier(symbol: str) -> list[str] | None:
    settings = get_settings()
    if not settings.tradier_access_token:
        return None
    try:
        resp = httpx.get(
            f"{settings.tradier_api_base}/markets/options/expirations",
            params={"symbol": symbol, "includeAllRoots": "true"},
            headers={
                "Authorization": f"Bearer {settings.tradier_access_token}",
                "Accept": "application/json",
            },
            timeout=10,
        )
        resp.raise_for_status()
        expirations = resp.json().get("expirations")
        if not expirations or expirations == "null":
            return None
        dates = expirations["date"]
        return dates if isinstance(dates, list) else [dates]
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Tradier expirations fetch failed for %s: %s", symbol, exc)
        return None


def _chain_from_tradier(symbol: str, expiration: str) -> OptionChain | None:
    settings = get_settings()
    if not settings.tradier_access_token:
        return None
    try:
        resp = httpx.get(
            f"{settings.tradier_api_base}/markets/options/chains",
            params={"symbol": symbol, "expiration": expiration, "greeks": "false"},
            headers={
                "Authorization": f"Bearer {settings.tradier_access_token}",
                "Accept": "application/json",
            },
            timeout=10,
        )
        resp.raise_for_status()
        options = resp.json().get("options")
        if not options or options == "null":
            return None
        rows = options["option"]
        rows = rows if isinstance(rows, list) else [rows]

        calls: list[OptionContract] = []
        puts: list[OptionContract] = []
        for row in rows:
            contract: OptionContract = {
                "strike": float(row["strike"]),
                "bid": float(row.get("bid") or 0),
                "ask": float(row.get("ask") or 0),
                "last": float(row.get("last") or 0),
                "volume": int(row.get("volume") or 0),
                "open_interest": int(row.get("open_interest") or 0),
                "implied_volatility": None,
                "in_the_money": False,
            }
            (calls if row["option_type"] == "call" else puts).append(contract)

        return {"expiration": expiration, "calls": calls, "puts": puts}
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Tradier chain fetch failed for %s %s: %s", symbol, expiration, exc)
        return None


def _expirations_from_yfinance(symbol: str) -> list[str]:
    expirations = yf.Ticker(symbol).options
    if not expirations:
        raise SymbolNotFoundError(f"No options chain found for symbol '{symbol}'")
    return list(expirations)


def _row_to_contract(row) -> OptionContract:
    return {
        "strike": float(row.strike),
        "bid": float(row.bid),
        "ask": float(row.ask),
        "last": float(row.lastPrice),
        "volume": int(row.volume) if row.volume == row.volume else 0,  # NaN check
        "open_interest": int(row.openInterest) if row.openInterest == row.openInterest else 0,
        "implied_volatility": float(row.impliedVolatility),
        "in_the_money": bool(row.inTheMoney),
    }


def _chain_from_yfinance(symbol: str, expiration: str) -> OptionChain:
    chain = yf.Ticker(symbol).option_chain(expiration)
    return {
        "expiration": expiration,
        "calls": [_row_to_contract(row) for row in chain.calls.itertuples()],
        "puts": [_row_to_contract(row) for row in chain.puts.itertuples()],
    }


def get_expirations(symbol: str) -> list[str]:
    """Available option expiration dates, Tradier sandbox first, yfinance as fallback."""
    expirations = _expirations_from_tradier(symbol)
    if expirations:
        return expirations
    return _expirations_from_yfinance(symbol)


def get_chain(symbol: str, expiration: str) -> OptionChain:
    """Full calls/puts chain for one expiration, Tradier sandbox first, yfinance as fallback."""
    chain = _chain_from_tradier(symbol, expiration)
    if chain:
        return chain
    return _chain_from_yfinance(symbol, expiration)


def get_contract_quote(symbol: str, option_type: str, strike: float, expiration: str) -> OptionContract:
    """Look up a single contract's current quote within its expiration's chain."""
    chain = get_chain(symbol, expiration)
    contracts = chain["calls"] if option_type == "call" else chain["puts"]
    for contract in contracts:
        if abs(contract["strike"] - strike) < 1e-6:
            return contract
    raise SymbolNotFoundError(
        f"No {option_type} contract at strike {strike} for {symbol} {expiration}"
    )
