from fastapi import APIRouter, HTTPException, Query

from app.schemas.options import OptionChainRead
from app.services import options
from app.services.market_data import SymbolNotFoundError

router = APIRouter(prefix="/symbols", tags=["options"])


@router.get("/{symbol}/options/expirations", response_model=list[str])
def get_expirations(symbol: str) -> list[str]:
    try:
        return options.get_expirations(symbol)
    except SymbolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{symbol}/options/chain", response_model=OptionChainRead)
def get_chain(symbol: str, expiration: str = Query(...)) -> OptionChainRead:
    try:
        chain = options.get_chain(symbol, expiration)
    except SymbolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return OptionChainRead(symbol=symbol.upper(), **chain)
