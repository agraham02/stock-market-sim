from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.portfolio import Portfolio


def get_or_create_portfolio(db: Session) -> Portfolio:
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
