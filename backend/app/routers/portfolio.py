from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioRead

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioRead)
def get_portfolio(db: Session = Depends(get_db)) -> Portfolio:
    """Return the single local portfolio, creating it with the default balance if needed."""
    portfolio = db.query(Portfolio).first()
    if portfolio is None:
        settings = get_settings()
        portfolio = Portfolio(
            cash_balance=settings.default_starting_balance,
            starting_balance=settings.default_starting_balance,
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio
