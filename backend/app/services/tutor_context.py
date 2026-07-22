from sqlalchemy.orm import Session

from app.models.lesson import Lesson
from app.models.trade import Trade
from app.services import market_data
from app.services.patterns import detect_patterns

BASE_SYSTEM_PROMPT = (
    "You are the AI tutor for a paper-trading options learning app. Your job is to teach the "
    "reasoning behind trading decisions, not just mechanics. Be concise (a few sentences unless "
    "the question genuinely needs more), concrete, and tie your answer back to the specific "
    "context given below when it's relevant. This app uses simulated money only — never give "
    "advice framed as real-money financial advice."
)


def build_system_prompt(db: Session, context_type: str, context_id: str | None) -> str:
    context_block = _build_context_block(db, context_type, context_id)
    if context_block:
        return f"{BASE_SYSTEM_PROMPT}\n\n---\nCurrent context:\n{context_block}"
    return BASE_SYSTEM_PROMPT


def _build_context_block(db: Session, context_type: str, context_id: str | None) -> str | None:
    if context_type == "symbol" and context_id:
        return _symbol_context(db, context_id)
    if context_type == "trade" and context_id:
        return _trade_context(db, context_id)
    if context_type == "lesson" and context_id:
        return _lesson_context(db, context_id)
    return None


def _symbol_context(db: Session, symbol: str) -> str | None:
    try:
        candles = market_data.get_ohlc(db, symbol, days=30)
    except Exception:
        return None
    if not candles:
        return None

    patterns = detect_patterns(candles, lookback=10)
    lines = [f"Symbol: {symbol.upper()}", "Last 5 daily candles (date: open/high/low/close):"]
    for candle in candles[-5:]:
        lines.append(f"  {candle['time']}: {candle['open']}/{candle['high']}/{candle['low']}/{candle['close']}")

    if patterns:
        lines.append("Recently detected candlestick patterns:")
        for hit in patterns[-5:]:
            labels = ", ".join(p["label"] for p in hit["patterns"])
            lines.append(f"  {hit['time']}: {labels}")

    return "\n".join(lines)


def _trade_context(db: Session, trade_id_str: str) -> str | None:
    try:
        trade_id = int(trade_id_str)
    except ValueError:
        return None

    trade = db.get(Trade, trade_id)
    if trade is None:
        return None

    position = trade.position
    journal = trade.journal_entry
    lines = [
        f"Symbol: {position.symbol}",
        f"Type: {position.option_type.value} strike={position.strike} expiration={position.expiration}",
        f"Status: {position.status.value}",
    ]

    if journal:
        lines += [
            f"Catalyst: {journal.catalyst.value}",
            f"Direction thesis: {journal.direction.value}",
            f"Expected magnitude: {journal.expected_magnitude * 100:.1f}%",
            f"IV at entry: {journal.iv_at_entry * 100:.1f}%" if journal.iv_at_entry is not None else "IV at entry: n/a",
            f"Rationale: {journal.timeframe_rationale}",
            f"Confidence: {journal.confidence}/5",
            f"Underlying price at entry: {journal.underlying_price_at_entry}",
        ]
        if journal.underlying_price_at_exit is not None:
            lines.append(f"Underlying price at exit: {journal.underlying_price_at_exit}")
            lines.append(
                "Grades — direction: {}, magnitude: {}, timing: {}, iv_crush_avoided: {}".format(
                    journal.grade_direction, journal.grade_magnitude, journal.grade_timing, journal.grade_iv_crush
                )
            )

    return "\n".join(lines)


def _lesson_context(db: Session, lesson_id_str: str) -> str | None:
    try:
        lesson_id = int(lesson_id_str)
    except ValueError:
        return None

    lesson = db.get(Lesson, lesson_id)
    if lesson is None:
        return None

    return f"Lesson {lesson.order}: {lesson.title}\n\n{lesson.content_md}"
