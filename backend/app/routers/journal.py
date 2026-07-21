from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.models.journal_entry import JournalEntry
from app.models.trade import Trade
from app.schemas.journal import JournalEntryRead
from app.services.trading import resolve_expired_positions

router = APIRouter(prefix="/journal", tags=["journal"])


@router.get("", response_model=list[JournalEntryRead])
def list_journal_entries(db: Session = Depends(get_db)) -> list[JournalEntryRead]:
    resolve_expired_positions(db)

    entries = (
        db.query(JournalEntry)
        .join(Trade, JournalEntry.trade_id == Trade.id)
        .options(joinedload(JournalEntry.trade).joinedload(Trade.position))
        .order_by(JournalEntry.id.desc())
        .all()
    )

    return [
        JournalEntryRead(
            id=entry.id,
            trade_id=entry.trade_id,
            position_id=entry.trade.position.id,
            symbol=entry.trade.position.symbol,
            option_type=entry.trade.position.option_type,
            strike=entry.trade.position.strike,
            expiration=entry.trade.position.expiration,
            status=entry.trade.position.status,
            catalyst=entry.catalyst,
            direction=entry.direction,
            expected_magnitude=entry.expected_magnitude,
            iv_at_entry=entry.iv_at_entry,
            timeframe_rationale=entry.timeframe_rationale,
            confidence=entry.confidence,
            underlying_price_at_entry=entry.underlying_price_at_entry,
            created_at=entry.trade.timestamp,
            underlying_price_at_exit=entry.underlying_price_at_exit,
            grade_direction=entry.grade_direction,
            grade_magnitude=entry.grade_magnitude,
            grade_timing=entry.grade_timing,
            grade_iv_crush=entry.grade_iv_crush,
            notes=entry.notes,
        )
        for entry in entries
    ]
