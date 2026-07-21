from datetime import date

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.position import OptionType, Position, PositionStatus
from app.models.trade import Trade, TradeAction
from app.services import market_data, options
from app.services.portfolio_service import get_or_create_portfolio


class OrderWouldNotFillError(Exception):
    pass


class InsufficientFundsError(Exception):
    pass


def contract_multiplier(option_type: OptionType) -> int:
    return 1 if option_type == OptionType.none else 100


def _is_short_dated(expiration: date | None) -> bool:
    return expiration is not None and (expiration - date.today()).days <= 2


def _determine_fill_price(
    order_type: str, limit_price: float | None, bid: float, ask: float, *, side: str
) -> float:
    if order_type not in ("market", "limit"):
        raise ValueError(f"Unknown order_type '{order_type}'")
    if order_type == "limit" and limit_price is None:
        raise ValueError("limit_price is required for limit orders")

    if side == "buy":
        market_price = ask
        if order_type == "limit" and market_price > limit_price:
            raise OrderWouldNotFillError(
                f"Ask ${market_price:.2f} is above your limit ${limit_price:.2f} — order would not fill"
            )
        return market_price

    market_price = bid
    if order_type == "limit" and market_price < limit_price:
        raise OrderWouldNotFillError(
            f"Bid ${market_price:.2f} is below your limit ${limit_price:.2f} — order would not fill"
        )
    return market_price


def _current_quote(db: Session, symbol: str, option_type: OptionType, strike: float | None, expiration: date | None) -> tuple[float, float]:
    """Return (bid, ask) for the position's underlying or option contract."""
    if option_type == OptionType.none:
        candles = market_data.get_ohlc(db, symbol, days=5)
        last_close = candles[-1]["close"]
        return last_close, last_close

    contract = options.get_contract_quote(symbol, option_type.value, strike, expiration.isoformat())
    return contract["bid"], contract["ask"]


def open_position(
    db: Session,
    *,
    symbol: str,
    option_type: OptionType,
    strike: float | None,
    expiration: date | None,
    quantity: int,
    order_type: str = "market",
    limit_price: float | None = None,
) -> tuple[Position, str | None]:
    if quantity <= 0:
        raise ValueError("quantity must be positive")
    if option_type != OptionType.none and (strike is None or expiration is None):
        raise ValueError("strike and expiration are required for option trades")

    symbol = symbol.upper()
    multiplier = contract_multiplier(option_type)

    bid, ask = _current_quote(db, symbol, option_type, strike, expiration)
    fill_price = _determine_fill_price(order_type, limit_price, bid, ask, side="buy")
    cost = fill_price * quantity * multiplier

    portfolio = get_or_create_portfolio(db)
    if cost > portfolio.cash_balance:
        raise InsufficientFundsError(
            f"Cost ${cost:,.2f} exceeds available cash ${portfolio.cash_balance:,.2f}"
        )

    portfolio_value_before = portfolio.cash_balance
    portfolio.cash_balance -= cost

    position = Position(
        portfolio_id=portfolio.id,
        symbol=symbol,
        option_type=option_type,
        strike=strike,
        expiration=expiration,
        quantity=quantity,
        entry_price=fill_price,
        status=PositionStatus.open,
    )
    db.add(position)
    db.flush()
    db.add(Trade(position_id=position.id, action=TradeAction.open, fill_price=fill_price))
    db.commit()
    db.refresh(position)

    warning = None
    threshold = get_settings().risk_warning_threshold_pct
    if cost > threshold * portfolio_value_before:
        pct = cost / portfolio_value_before
        short_dated_note = " and it's short-dated, so theta/gamma risk is elevated" if _is_short_dated(expiration) else ""
        warning = f"This trade uses {pct:.0%} of your portfolio value{short_dated_note} — consider sizing down."

    return position, warning


def close_position(
    db: Session,
    position_id: int,
    order_type: str = "market",
    limit_price: float | None = None,
) -> Position:
    position = db.get(Position, position_id)
    if position is None:
        raise LookupError(f"Position {position_id} not found")
    if position.status != PositionStatus.open:
        raise ValueError(f"Position {position_id} is not open")

    multiplier = contract_multiplier(position.option_type)
    bid, ask = _current_quote(db, position.symbol, position.option_type, position.strike, position.expiration)
    fill_price = _determine_fill_price(order_type, limit_price, bid, ask, side="sell")
    proceeds = fill_price * position.quantity * multiplier

    portfolio = get_or_create_portfolio(db)
    portfolio.cash_balance += proceeds

    position.status = PositionStatus.closed
    db.add(Trade(position_id=position.id, action=TradeAction.close, fill_price=fill_price))
    db.commit()
    db.refresh(position)
    return position


def resolve_expired_positions(db: Session) -> None:
    """Auto-settle any open option positions past expiration at intrinsic value."""
    today = date.today()
    expired = (
        db.query(Position)
        .filter(
            Position.status == PositionStatus.open,
            Position.expiration.isnot(None),
            Position.expiration < today,
        )
        .all()
    )
    if not expired:
        return

    portfolio = get_or_create_portfolio(db)
    for position in expired:
        candles = market_data.get_ohlc(db, position.symbol, days=5)
        underlying_price = candles[-1]["close"]

        if position.option_type == OptionType.call:
            intrinsic = max(0.0, underlying_price - position.strike)
        else:
            intrinsic = max(0.0, position.strike - underlying_price)

        multiplier = contract_multiplier(position.option_type)
        portfolio.cash_balance += intrinsic * position.quantity * multiplier

        position.status = PositionStatus.expired
        db.add(Trade(position_id=position.id, action=TradeAction.close, fill_price=intrinsic))

    db.commit()


def position_pnl(db: Session, position: Position) -> dict:
    """Compute mark_price/pnl/days_to_expiration for a single position (used right after open/close)."""
    multiplier = contract_multiplier(position.option_type)

    if position.status == PositionStatus.open:
        bid, ask = _current_quote(db, position.symbol, position.option_type, position.strike, position.expiration)
        mark_price = (bid + ask) / 2
    else:
        close_trade = (
            db.query(Trade)
            .filter(Trade.position_id == position.id, Trade.action == TradeAction.close)
            .order_by(Trade.timestamp.desc())
            .first()
        )
        mark_price = close_trade.fill_price if close_trade else position.entry_price

    pnl = (mark_price - position.entry_price) * position.quantity * multiplier
    days_to_expiration = (position.expiration - date.today()).days if position.expiration else None

    return {"mark_price": mark_price, "pnl": pnl, "days_to_expiration": days_to_expiration}


def list_positions_with_pnl(db: Session) -> list[dict]:
    resolve_expired_positions(db)
    positions = db.query(Position).order_by(Position.created_at.desc()).all()

    results = []
    for position in positions:
        multiplier = contract_multiplier(position.option_type)

        if position.status == PositionStatus.open:
            try:
                bid, ask = _current_quote(
                    db, position.symbol, position.option_type, position.strike, position.expiration
                )
                mark_price = (bid + ask) / 2
            except Exception:
                mark_price = position.entry_price
        else:
            close_trade = (
                db.query(Trade)
                .filter(Trade.position_id == position.id, Trade.action == TradeAction.close)
                .order_by(Trade.timestamp.desc())
                .first()
            )
            mark_price = close_trade.fill_price if close_trade else position.entry_price

        pnl = (mark_price - position.entry_price) * position.quantity * multiplier
        days_to_expiration = (position.expiration - date.today()).days if position.expiration else None

        results.append(
            {
                "position": position,
                "mark_price": mark_price,
                "pnl": pnl,
                "days_to_expiration": days_to_expiration,
            }
        )

    return results
