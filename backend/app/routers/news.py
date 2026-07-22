from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.news import CatalystPanel, SentimentResult
from app.services import news as news_service

router = APIRouter(prefix="/symbols", tags=["news"])


@router.get("/{symbol}/catalysts", response_model=CatalystPanel)
def get_catalysts(symbol: str, db: Session = Depends(get_db)) -> CatalystPanel:
    return news_service.get_catalyst_panel(db, symbol)


@router.post("/{symbol}/sentiment", response_model=SentimentResult)
def get_sentiment(symbol: str, db: Session = Depends(get_db)) -> SentimentResult:
    try:
        return news_service.get_sentiment(db, symbol)
    except news_service.SentimentUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
