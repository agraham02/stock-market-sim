from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioRead
from app.services.portfolio_service import get_or_create_portfolio

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioRead)
def get_portfolio(db: Session = Depends(get_db)) -> Portfolio:
    return get_or_create_portfolio(db)
