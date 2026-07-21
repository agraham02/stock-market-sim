from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.journal_entry import Catalyst, Direction
from app.models.position import OptionType, PositionStatus


class OpenTradeRequest(BaseModel):
    symbol: str
    option_type: OptionType = OptionType.none
    strike: float | None = None
    expiration: date | None = None
    quantity: int
    order_type: str = "market"
    limit_price: float | None = None

    # Decision Framework — required before any simulated trade
    catalyst: Catalyst
    direction: Direction
    expected_magnitude: float = Field(gt=0, description="Expected move size as a decimal fraction, e.g. 0.05 for 5%")
    timeframe_rationale: str = Field(min_length=1)
    confidence: int = Field(ge=1, le=5)


class CloseTradeRequest(BaseModel):
    order_type: str = "market"
    limit_price: float | None = None


class PositionRead(BaseModel):
    id: int
    symbol: str
    option_type: OptionType
    strike: float | None
    expiration: date | None
    quantity: int
    entry_price: float
    status: PositionStatus
    created_at: datetime
    mark_price: float
    pnl: float
    days_to_expiration: int | None


class OpenTradeResponse(BaseModel):
    position: PositionRead
    warning: str | None
