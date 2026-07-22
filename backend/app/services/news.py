import logging
from datetime import date, datetime, timedelta, timezone
from typing import TypedDict

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.news_cache import NewsCache
from app.models.sentiment_cache import SentimentCache

logger = logging.getLogger(__name__)


class NewsArticle(TypedDict):
    headline: str
    summary: str
    source: str
    url: str
    datetime: str  # ISO 8601
    image: str | None


class EarningsEvent(TypedDict):
    date: str
    hour: str | None
    eps_estimate: float | None
    eps_actual: float | None
    revenue_estimate: float | None
    revenue_actual: float | None


class CatalystPanel(TypedDict):
    symbol: str
    news: list[NewsArticle]
    earnings: list[EarningsEvent]
    fetched_at: str


class TickerSentiment(TypedDict):
    relevance_score: float
    sentiment_score: float
    sentiment_label: str


class SentimentArticle(TypedDict):
    title: str
    url: str
    source: str
    time_published: str
    overall_sentiment_score: float
    overall_sentiment_label: str
    ticker_sentiment: TickerSentiment | None


class SentimentResult(TypedDict):
    symbol: str
    articles: list[SentimentArticle]
    average_sentiment_score: float | None
    average_sentiment_label: str | None
    fetched_at: str
    cached: bool


class SentimentUnavailableError(Exception):
    pass


def _fetch_finnhub_news(symbol: str, api_key: str) -> list[NewsArticle]:
    today = date.today()
    resp = httpx.get(
        "https://finnhub.io/api/v1/company-news",
        params={
            "symbol": symbol,
            "from": (today - timedelta(days=14)).isoformat(),
            "to": today.isoformat(),
            "token": api_key,
        },
        timeout=10,
    )
    resp.raise_for_status()
    items = resp.json()
    if not isinstance(items, list):
        return []

    articles: list[NewsArticle] = [
        {
            "headline": item.get("headline", ""),
            "summary": item.get("summary", ""),
            "source": item.get("source", ""),
            "url": item.get("url", ""),
            "datetime": datetime.fromtimestamp(item["datetime"], tz=timezone.utc).isoformat(),
            "image": item.get("image") or None,
        }
        for item in items
        if item.get("datetime") and item.get("headline")
    ]
    articles.sort(key=lambda a: a["datetime"], reverse=True)
    return articles[:15]


def _fetch_finnhub_earnings(symbol: str, api_key: str) -> list[EarningsEvent]:
    today = date.today()
    resp = httpx.get(
        "https://finnhub.io/api/v1/calendar/earnings",
        params={
            "symbol": symbol,
            "from": (today - timedelta(days=7)).isoformat(),
            "to": (today + timedelta(days=90)).isoformat(),
            "token": api_key,
        },
        timeout=10,
    )
    resp.raise_for_status()
    events = resp.json().get("earningsCalendar") or []

    earnings: list[EarningsEvent] = [
        {
            "date": event["date"],
            "hour": event.get("hour") or None,
            "eps_estimate": event.get("epsEstimate"),
            "eps_actual": event.get("epsActual"),
            "revenue_estimate": event.get("revenueEstimate"),
            "revenue_actual": event.get("revenueActual"),
        }
        for event in events
        if event.get("date")
    ]
    earnings.sort(key=lambda e: e["date"])
    return earnings


def get_catalyst_panel(db: Session, symbol: str, cache_ttl_minutes: int = 30) -> CatalystPanel:
    """Finnhub headlines + earnings calendar, cached. Empty (not an error) when no API key is set."""
    symbol = symbol.upper()
    settings = get_settings()
    cached = db.get(NewsCache, symbol)

    if cached is not None:
        age = datetime.now(timezone.utc) - cached.fetched_at
        if age < timedelta(minutes=cache_ttl_minutes):
            return {
                "symbol": symbol,
                "news": cached.news_json,
                "earnings": cached.earnings_json,
                "fetched_at": cached.fetched_at.isoformat(),
            }

    if not settings.finnhub_api_key:
        return {"symbol": symbol, "news": [], "earnings": [], "fetched_at": datetime.now(timezone.utc).isoformat()}

    try:
        news = _fetch_finnhub_news(symbol, settings.finnhub_api_key)
        earnings = _fetch_finnhub_earnings(symbol, settings.finnhub_api_key)
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        logger.warning("Finnhub fetch failed for %s: %s", symbol, exc)
        if cached is not None:
            return {
                "symbol": symbol,
                "news": cached.news_json,
                "earnings": cached.earnings_json,
                "fetched_at": cached.fetched_at.isoformat(),
            }
        return {"symbol": symbol, "news": [], "earnings": [], "fetched_at": datetime.now(timezone.utc).isoformat()}

    if cached is None:
        cached = NewsCache(symbol=symbol, news_json=news, earnings_json=earnings)
        db.add(cached)
    else:
        cached.news_json = news
        cached.earnings_json = earnings
        cached.fetched_at = datetime.now(timezone.utc)
    db.commit()

    return {"symbol": symbol, "news": news, "earnings": earnings, "fetched_at": cached.fetched_at.isoformat()}


def _average_sentiment(articles: list[SentimentArticle]) -> tuple[float | None, str | None]:
    scores = [a["overall_sentiment_score"] for a in articles if a["overall_sentiment_score"] is not None]
    if not scores:
        return None, None
    avg = sum(scores) / len(scores)
    if avg <= -0.35:
        label = "Bearish"
    elif avg <= -0.15:
        label = "Somewhat-Bearish"
    elif avg < 0.15:
        label = "Neutral"
    elif avg < 0.35:
        label = "Somewhat-Bullish"
    else:
        label = "Bullish"
    return round(avg, 4), label


def get_sentiment(db: Session, symbol: str, cache_ttl_hours: int = 24) -> SentimentResult:
    """On-demand Alpha Vantage News & Sentiment pull. Aggressively cached — free tier is 25 req/day."""
    symbol = symbol.upper()
    settings = get_settings()

    if not settings.alpha_vantage_api_key:
        raise SentimentUnavailableError("ALPHA_VANTAGE_API_KEY is not configured")

    cached = db.get(SentimentCache, symbol)
    if cached is not None:
        age = datetime.now(timezone.utc) - cached.fetched_at
        if age < timedelta(hours=cache_ttl_hours):
            return {**cached.sentiment_json, "fetched_at": cached.fetched_at.isoformat(), "cached": True}

    resp = httpx.get(
        "https://www.alphavantage.co/query",
        params={"function": "NEWS_SENTIMENT", "tickers": symbol, "limit": 20, "apikey": settings.alpha_vantage_api_key},
        timeout=15,
    )
    resp.raise_for_status()
    payload = resp.json()

    if "Information" in payload or "Note" in payload or "Error Message" in payload:
        detail = payload.get("Information") or payload.get("Note") or payload.get("Error Message")
        raise SentimentUnavailableError(f"Alpha Vantage: {detail}")

    articles: list[SentimentArticle] = []
    for item in payload.get("feed", []):
        ticker_sentiment = None
        for ts in item.get("ticker_sentiment", []):
            if ts.get("ticker") == symbol:
                ticker_sentiment = {
                    "relevance_score": float(ts.get("relevance_score", 0)),
                    "sentiment_score": float(ts.get("ticker_sentiment_score", 0)),
                    "sentiment_label": ts.get("ticker_sentiment_label", ""),
                }
                break

        articles.append(
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "source": item.get("source", ""),
                "time_published": item.get("time_published", ""),
                "overall_sentiment_score": item.get("overall_sentiment_score"),
                "overall_sentiment_label": item.get("overall_sentiment_label", ""),
                "ticker_sentiment": ticker_sentiment,
            }
        )

    avg_score, avg_label = _average_sentiment(articles)
    result = {"symbol": symbol, "articles": articles, "average_sentiment_score": avg_score, "average_sentiment_label": avg_label}

    if cached is None:
        cached = SentimentCache(symbol=symbol, sentiment_json=result)
        db.add(cached)
    else:
        cached.sentiment_json = result
        cached.fetched_at = datetime.now(timezone.utc)
    db.commit()

    return {**result, "fetched_at": cached.fetched_at.isoformat(), "cached": False}
