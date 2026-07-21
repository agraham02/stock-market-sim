import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.db import Base


class OptionType(str, enum.Enum):
    call = "call"
    put = "put"
    none = "none"  # plain equity position


class PositionStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    expired = "expired"


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(primary_key=True)
    portfolio_id: Mapped[int] = mapped_column(ForeignKey("portfolios.id"), nullable=False)
    symbol: Mapped[str] = mapped_column(String(16), nullable=False)
    option_type: Mapped[OptionType] = mapped_column(
        Enum(OptionType, name="option_type"), default=OptionType.none, nullable=False
    )
    strike: Mapped[float | None] = mapped_column(Numeric(12, 4), nullable=True)
    expiration: Mapped[date | None] = mapped_column(Date, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    entry_price: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    status: Mapped[PositionStatus] = mapped_column(
        Enum(PositionStatus, name="position_status"), default=PositionStatus.open, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    portfolio: Mapped["Portfolio"] = relationship(back_populates="positions")
    trades: Mapped[list["Trade"]] = relationship(back_populates="position")
