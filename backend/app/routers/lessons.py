from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.lesson import Lesson
from app.schemas.lesson import LessonDetailRead, LessonRead

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("", response_model=list[LessonRead])
def list_lessons(db: Session = Depends(get_db)) -> list[Lesson]:
    return db.query(Lesson).order_by(Lesson.order).all()


@router.get("/{lesson_id}", response_model=LessonDetailRead)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail=f"Lesson {lesson_id} not found")
    return lesson


@router.post("/{lesson_id}/complete", response_model=LessonRead)
def complete_lesson(lesson_id: int, db: Session = Depends(get_db)) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail=f"Lesson {lesson_id} not found")
    lesson.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(lesson)
    return lesson
