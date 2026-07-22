from datetime import datetime

from pydantic import BaseModel

from app.models.chat_message import ChatContextType, ChatRole


class TutorChatRequest(BaseModel):
    context_type: ChatContextType
    context_id: str | None = None
    message: str


class ChatMessageRead(BaseModel):
    id: int
    role: ChatRole
    content: str
    context_type: ChatContextType
    context_id: str | None
    timestamp: datetime

    class Config:
        from_attributes = True


class TutorChatResponse(BaseModel):
    messages: list[ChatMessageRead]
