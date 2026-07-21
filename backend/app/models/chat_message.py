import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.db import Base


class ChatRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"


class ChatContextType(str, enum.Enum):
    lesson = "lesson"
    trade = "trade"
    symbol = "symbol"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[ChatRole] = mapped_column(Enum(ChatRole, name="chat_role"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    context_type: Mapped[ChatContextType] = mapped_column(
        Enum(ChatContextType, name="chat_context_type"), nullable=False
    )
    context_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
