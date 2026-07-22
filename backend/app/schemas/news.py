from pydantic import BaseModel


class NewsArticle(BaseModel):
    headline: str
    summary: str
    source: str
    url: str
    datetime: str
    image: str | None


class EarningsEvent(BaseModel):
    date: str
    hour: str | None
    eps_estimate: float | None
    eps_actual: float | None
    revenue_estimate: float | None
    revenue_actual: float | None


class CatalystPanel(BaseModel):
    symbol: str
    news: list[NewsArticle]
    earnings: list[EarningsEvent]
    fetched_at: str


class TickerSentiment(BaseModel):
    relevance_score: float
    sentiment_score: float
    sentiment_label: str


class SentimentArticle(BaseModel):
    title: str
    url: str
    source: str
    time_published: str
    overall_sentiment_score: float | None
    overall_sentiment_label: str
    ticker_sentiment: TickerSentiment | None


class SentimentResult(BaseModel):
    symbol: str
    articles: list[SentimentArticle]
    average_sentiment_score: float | None
    average_sentiment_label: str | None
    fetched_at: str
    cached: bool
