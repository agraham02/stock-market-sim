from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.symbol import SymbolChart
from app.services import market_data
from app.services.patterns import detect_patterns

router = APIRouter(prefix="/symbols", tags=["symbols"])


@router.get("/{symbol}/chart", response_model=SymbolChart)
def get_symbol_chart(
    symbol: str,
    days: int = Query(180, ge=30, le=730),
    db: Session = Depends(get_db),
) -> SymbolChart:
    try:
        candles = market_data.get_ohlc(db, symbol, days=days)
    except market_data.SymbolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    patterns = detect_patterns(candles)
    return SymbolChart(symbol=symbol.upper(), candles=candles, patterns=patterns)
