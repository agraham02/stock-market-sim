from datetime import datetime

from pydantic import BaseModel


class LessonRead(BaseModel):
    id: int
    title: str
    order: int
    completed_at: datetime | None


class LessonDetailRead(LessonRead):
    content_md: str
    walkthrough_json: list[dict] | None = None
    quiz_json: list[dict] | None = None
    scenario_json: dict | None = None
