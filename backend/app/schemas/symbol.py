from pydantic import BaseModel


class Candle(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class PatternMatch(BaseModel):
    name: str
    label: str
    explanation: str
    direction: str


class PatternHit(BaseModel):
    time: str
    patterns: list[PatternMatch]


class SymbolChart(BaseModel):
    symbol: str
    candles: list[Candle]
    patterns: list[PatternHit]
