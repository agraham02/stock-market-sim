from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    content_md: Mapped[str] = mapped_column(Text, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Optional interactive screen walkthrough: a list of TourStep-shaped dicts (see
    # frontend/src/lib/tours/types.ts), only present for lessons with a distinct UI surface to
    # point at. Null for most lessons.
    walkthrough_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    # Optional comprehension quiz: list of {id, prompt, choices: [{id, text, correct, explanation}]}.
    quiz_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    # Optional branching "what would you do" scenario: {start, nodes: {id: {prompt, choices: [{text, next, outcome}]}}}.
    scenario_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
