from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.trading import PositionRead
from app.services.trading import list_positions_with_pnl

router = APIRouter(prefix="/positions", tags=["positions"])


@router.get("", response_model=list[PositionRead])
def get_positions(db: Session = Depends(get_db)) -> list[PositionRead]:
    return [
        PositionRead(**row["position"].__dict__, mark_price=row["mark_price"], pnl=row["pnl"], days_to_expiration=row["days_to_expiration"])
        for row in list_positions_with_pnl(db)
    ]
