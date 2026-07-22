import json

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.models.chat_message import ChatContextType, ChatMessage, ChatRole
from app.schemas.tutor import ChatMessageRead, TutorChatRequest
from app.services.ai_tutor import TutorNotConfiguredError, get_tutor_provider
from app.services.ai_tutor.base import TutorMessage
from app.services.tutor_context import build_system_prompt

router = APIRouter(prefix="/tutor", tags=["tutor"])


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.get("/history", response_model=list[ChatMessageRead])
def get_history(
    context_type: ChatContextType = Query(...),
    context_id: str | None = Query(None),
    db: Session = Depends(get_db),
) -> list[ChatMessage]:
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.context_type == context_type, ChatMessage.context_id == context_id)
        .order_by(ChatMessage.timestamp)
        .all()
    )


@router.post("/chat")
def chat(request: TutorChatRequest, db: Session = Depends(get_db)) -> StreamingResponse:
    settings = get_settings()
    try:
        provider = get_tutor_provider(settings)
    except TutorNotConfiguredError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    history_rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.context_type == request.context_type, ChatMessage.context_id == request.context_id)
        .order_by(ChatMessage.timestamp)
        .all()
    )
    history: list[TutorMessage] = [{"role": row.role.value, "content": row.content} for row in history_rows]
    system_prompt = build_system_prompt(db, request.context_type.value, request.context_id)

    # Persisted immediately (before streaming starts) so it survives even if the model call fails.
    user_row = ChatMessage(
        role=ChatRole.user,
        content=request.message,
        context_type=request.context_type,
        context_id=request.context_id,
    )
    db.add(user_row)
    db.commit()
    db.refresh(user_row)

    def event_stream():
        yield _sse("user", ChatMessageRead.model_validate(user_row).model_dump(mode="json"))

        full_text = ""
        try:
            for chunk in provider.reply_stream(system_prompt, history, request.message):
                full_text += chunk
                yield _sse("delta", {"text": chunk})
        except Exception as exc:
            yield _sse("error", {"detail": f"AI tutor request failed: {exc}"})
            return

        assistant_row = ChatMessage(
            role=ChatRole.assistant,
            content=full_text,
            context_type=request.context_type,
            context_id=request.context_id,
        )
        db.add(assistant_row)
        db.commit()
        db.refresh(assistant_row)
        yield _sse("done", ChatMessageRead.model_validate(assistant_row).model_dump(mode="json"))

    return StreamingResponse(event_stream(), media_type="text/event-stream")
