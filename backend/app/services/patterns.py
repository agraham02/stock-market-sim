import pandas as pd
import pandas_ta_classic as ta  # noqa: F401 - registers the `.ta` DataFrame accessor

from app.services.pattern_descriptions import PATTERN_DESCRIPTIONS


def _pattern_key(column: str) -> str:
    """'CDL_DOJI_10_0.1' -> 'doji'; 'CDL_3WHITESOLDIERS' -> '3whitesoldiers'."""
    return column.removeprefix("CDL_").split("_")[0].lower()


def detect_patterns(candles: list[dict], lookback: int = 30) -> list[dict]:
    """Detect candlestick patterns on the most recent `lookback` candles.

    Returns a list of {time, patterns: [{name, label, explanation, direction}]}
    for each candle where at least one recognized pattern fired.
    """
    if len(candles) < 5:
        return []

    df = pd.DataFrame(candles)
    pattern_df = df.ta.cdl_pattern(name="all")
    pattern_df.index = df["time"]

    results = []
    for time_str, row in pattern_df.tail(lookback).iterrows():
        hits = row[row != 0]
        if hits.empty:
            continue

        matches = []
        for column, value in hits.items():
            meta = PATTERN_DESCRIPTIONS.get(_pattern_key(str(column)))
            if meta is None:
                continue
            matches.append(
                {
                    "name": _pattern_key(str(column)),
                    "label": meta["label"],
                    "explanation": meta["explanation"],
                    "direction": "bullish" if value > 0 else "bearish",
                }
            )

        if matches:
            results.append({"time": time_str, "patterns": matches})

    return results
