import enum

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Catalyst(str, enum.Enum):
    earnings = "earnings"
    news = "news"
    technical_setup = "technical_setup"
    momentum = "momentum"
    macro_event = "macro_event"
    none = "none"


class Direction(str, enum.Enum):
    up = "up"
    down = "down"


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    trade_id: Mapped[int] = mapped_column(ForeignKey("trades.id"), nullable=False, unique=True)

    # Decision Framework (filled in before the trade is placed)
    catalyst: Mapped[Catalyst] = mapped_column(Enum(Catalyst, name="catalyst"), nullable=False)
    direction: Mapped[Direction] = mapped_column(Enum(Direction, name="direction"), nullable=False)
    expected_magnitude: Mapped[float] = mapped_column(Numeric(6, 4), nullable=False)
    iv_at_entry: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    timeframe_rationale: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5

    # Grading (filled in after close/expiration)
    grade_direction: Mapped[bool | None] = mapped_column(nullable=True)
    grade_magnitude: Mapped[bool | None] = mapped_column(nullable=True)
    grade_timing: Mapped[bool | None] = mapped_column(nullable=True)
    grade_iv_crush: Mapped[bool | None] = mapped_column(nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    trade: Mapped["Trade"] = relationship(back_populates="journal_entry")
