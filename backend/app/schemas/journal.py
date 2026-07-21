from datetime import date, datetime

from pydantic import BaseModel

from app.models.journal_entry import Catalyst, Direction
from app.models.position import OptionType, PositionStatus


class JournalEntryRead(BaseModel):
    id: int
    trade_id: int
    position_id: int
    symbol: str
    option_type: OptionType
    strike: float | None
    expiration: date | None
    status: PositionStatus

    catalyst: Catalyst
    direction: Direction
    expected_magnitude: float
    iv_at_entry: float | None
    timeframe_rationale: str
    confidence: int
    underlying_price_at_entry: float
    created_at: datetime

    underlying_price_at_exit: float | None
    grade_direction: bool | None
    grade_magnitude: bool | None
    grade_timing: bool | None
    grade_iv_crush: bool | None
    notes: str | None
