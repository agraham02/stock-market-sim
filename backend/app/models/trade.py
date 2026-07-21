import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.db import Base


class TradeAction(str, enum.Enum):
    open = "open"
    close = "close"


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[int] = mapped_column(primary_key=True)
    position_id: Mapped[int] = mapped_column(ForeignKey("positions.id"), nullable=False)
    action: Mapped[TradeAction] = mapped_column(Enum(TradeAction, name="trade_action"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    fill_price: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    tradier_order_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    position: Mapped["Position"] = relationship(back_populates="trades")
    journal_entry: Mapped["JournalEntry"] = relationship(back_populates="trade", uselist=False)
