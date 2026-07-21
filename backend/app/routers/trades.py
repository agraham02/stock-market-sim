from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.trading import CloseTradeRequest, OpenTradeRequest, OpenTradeResponse, PositionRead
from app.services import trading
from app.services.market_data import SymbolNotFoundError

router = APIRouter(prefix="/trades", tags=["trades"])


@router.post("", response_model=OpenTradeResponse)
def open_trade(request: OpenTradeRequest, db: Session = Depends(get_db)) -> OpenTradeResponse:
    try:
        position, warning = trading.open_position(
            db,
            symbol=request.symbol,
            option_type=request.option_type,
            strike=request.strike,
            expiration=request.expiration,
            quantity=request.quantity,
            order_type=request.order_type,
            limit_price=request.limit_price,
        )
    except SymbolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except trading.OrderWouldNotFillError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except trading.InsufficientFundsError as exc:
        raise HTTPException(status_code=402, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    pnl_info = trading.position_pnl(db, position)
    return OpenTradeResponse(
        position=PositionRead(**position.__dict__, **pnl_info),
        warning=warning,
    )


@router.post("/{position_id}/close", response_model=PositionRead)
def close_trade(
    position_id: int, request: CloseTradeRequest, db: Session = Depends(get_db)
) -> PositionRead:
    try:
        position = trading.close_position(
            db, position_id, order_type=request.order_type, limit_price=request.limit_price
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except SymbolNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except trading.OrderWouldNotFillError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    pnl_info = trading.position_pnl(db, position)
    return PositionRead(**position.__dict__, **pnl_info)
