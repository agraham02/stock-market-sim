from datetime import datetime

from sqlalchemy import DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.db import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(primary_key=True)
    cash_balance: Mapped[float] = mapped_column(Numeric(14, 2, asdecimal=False), nullable=False)
    starting_balance: Mapped[float] = mapped_column(Numeric(14, 2, asdecimal=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    positions: Mapped[list["Position"]] = relationship(back_populates="portfolio")
