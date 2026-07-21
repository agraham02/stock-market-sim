from datetime import date, datetime

from pydantic import BaseModel

from app.models.position import OptionType, PositionStatus


class OpenTradeRequest(BaseModel):
    symbol: str
    option_type: OptionType = OptionType.none
    strike: float | None = None
    expiration: date | None = None
    quantity: int
    order_type: str = "market"
    limit_price: float | None = None


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
