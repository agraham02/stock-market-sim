from datetime import datetime

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.db import Base


class NewsCache(Base):
    __tablename__ = "news_cache"

    symbol: Mapped[str] = mapped_column(String(16), primary_key=True)
    news_json: Mapped[list] = mapped_column(JSON, nullable=False)
    earnings_json: Mapped[list] = mapped_column(JSON, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
