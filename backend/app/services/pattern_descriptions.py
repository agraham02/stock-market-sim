"""Plain-language explanations for every pandas-ta-classic candlestick pattern.

Keys are the pattern name as it appears in a `CDL_<NAME>` column (lowercased,
with any numeric parameter suffix stripped) returned by `df.ta.cdl_pattern`.
"""

PATTERN_DESCRIPTIONS: dict[str, dict[str, str]] = {
    "2crows": {
        "label": "Two Crows",
        "explanation": "After an uptrend, two candles gap up then close back down into the prior body — early sign buyers are losing control.",
    },
    "3blackcrows": {
        "label": "Three Black Crows",
        "explanation": "Three long, steady down candles in a row — sustained, aggressive selling after a rally.",
    },
    "3inside": {
        "label": "Three Inside Up/Down",
        "explanation": "A harami (small candle inside the prior body) confirmed by a third candle that breaks further in the new direction.",
    },
    "3linestrike": {
        "label": "Three-Line Strike",
        "explanation": "Three candles continue a trend, then a fourth erases all three in one move — a sharp, often temporary reversal.",
    },
    "3outside": {
        "label": "Three Outside Up/Down",
        "explanation": "An engulfing candle confirmed by a third candle continuing in the new direction — a more reliable reversal signal.",
    },
    "3starsinsouth": {
        "label": "Three Stars in the South",
        "explanation": "Three shrinking down candles with smaller ranges each time — selling pressure is fading near a bottom.",
    },
    "3whitesoldiers": {
        "label": "Three White Soldiers",
        "explanation": "Three long, steady up candles in a row — sustained, aggressive buying after a decline.",
    },
    "abandonedbaby": {
        "label": "Abandoned Baby",
        "explanation": "A doji gaps completely away from the candles on both sides — a rare but strong reversal signal.",
    },
    "advanceblock": {
        "label": "Advance Block",
        "explanation": "An uptrend continues but each candle has a shrinking body and longer upper wick — buyers are losing steam.",
    },
    "belthold": {
        "label": "Belt Hold",
        "explanation": "A candle opens at its high (or low) and closes strongly the other direction — an aggressive one-candle reversal cue.",
    },
    "breakaway": {
        "label": "Breakaway",
        "explanation": "A five-candle pattern where a gap in one direction is fully reversed by the close — an exhaustion signal.",
    },
    "closingmarubozu": {
        "label": "Closing Marubozu",
        "explanation": "A candle that closes at its high (or low) with no wick on that side — conviction into the close.",
    },
    "concealbabyswall": {
        "label": "Concealing Baby Swallow",
        "explanation": "A rare four-candle bearish continuation where the last candle fully engulfs the range of the prior two.",
    },
    "counterattack": {
        "label": "Counterattack",
        "explanation": "A gap in the trend's direction is immediately met by a candle closing at the same level as the prior close — a standoff.",
    },
    "darkcloudcover": {
        "label": "Dark Cloud Cover",
        "explanation": "After an up candle, the next opens higher but closes deep into the prior body — buyers were overpowered intraday.",
    },
    "doji": {
        "label": "Doji",
        "explanation": "Open and close are almost equal — indecision between buyers and sellers, often a pause point.",
    },
    "dojistar": {
        "label": "Doji Star",
        "explanation": "A doji gaps away from the prior trend candle — hesitation right after a strong move.",
    },
    "dragonflydoji": {
        "label": "Dragonfly Doji",
        "explanation": "A doji with a long lower wick and no upper wick — sellers pushed price down but buyers reclaimed it by the close.",
    },
    "engulfing": {
        "label": "Engulfing",
        "explanation": "A candle's body completely swallows the prior candle's body — a change of control between buyers and sellers.",
    },
    "eveningdojistar": {
        "label": "Evening Doji Star",
        "explanation": "An evening star where the middle candle is a doji — indecision at the top before a reversal down.",
    },
    "eveningstar": {
        "label": "Evening Star",
        "explanation": "A strong up candle, a small-bodied pause, then a strong down candle — a classic bearish topping pattern.",
    },
    "gapsidesidewhite": {
        "label": "Gap Side-by-Side White Lines",
        "explanation": "Two similar up candles gap away from the trend and hold their ground — the gap is likely to keep being supported.",
    },
    "gravestonedoji": {
        "label": "Gravestone Doji",
        "explanation": "A doji with a long upper wick and no lower wick — buyers pushed price up but sellers dragged it back to the open by the close.",
    },
    "hammer": {
        "label": "Hammer",
        "explanation": "A small body near the top of the range with a long lower wick after a downtrend — buyers stepped in and rejected lower prices.",
    },
    "hangingman": {
        "label": "Hanging Man",
        "explanation": "The same shape as a hammer, but after an uptrend — a warning that sellers tested control even as price closed near the high.",
    },
    "harami": {
        "label": "Harami",
        "explanation": "A small candle sits entirely inside the prior candle's body — momentum is stalling.",
    },
    "haramicross": {
        "label": "Harami Cross",
        "explanation": "A harami where the inside candle is a doji — an even stronger sign momentum has stalled.",
    },
    "highwave": {
        "label": "High Wave",
        "explanation": "A small body with very long wicks on both sides — a tug-of-war between buyers and sellers with no clear winner.",
    },
    "hikkake": {
        "label": "Hikkake",
        "explanation": "A false breakout trap: price briefly breaks a recent inside range, then reverses back through it.",
    },
    "hikkakemod": {
        "label": "Modified Hikkake",
        "explanation": "A variant of the hikkake trap that triggers closer to the false breakout, catching the reversal earlier.",
    },
    "homingpigeon": {
        "label": "Homing Pigeon",
        "explanation": "Two down candles where the second's smaller body sits inside the first — selling pressure is easing.",
    },
    "identical3crows": {
        "label": "Identical Three Crows",
        "explanation": "Three near-identical long down candles, each opening at or near the prior close — relentless, orderly selling.",
    },
    "inneck": {
        "label": "In Neck",
        "explanation": "A down candle followed by an up candle that closes just barely above the prior close — a weak, likely failed bounce.",
    },
    "inside": {
        "label": "Inside Bar",
        "explanation": "A candle's entire range sits inside the prior candle's range — the market is compressing before its next move.",
    },
    "invertedhammer": {
        "label": "Inverted Hammer",
        "explanation": "A small body near the bottom with a long upper wick after a downtrend — buyers tested higher prices; needs confirmation.",
    },
    "kicking": {
        "label": "Kicking",
        "explanation": "A marubozu gaps away from the opposite marubozu before it with no overlap — an abrupt, forceful reversal.",
    },
    "kickingbylength": {
        "label": "Kicking by Length",
        "explanation": "Same as Kicking, marked by which of the two marubozu candles has the longer body.",
    },
    "ladderbottom": {
        "label": "Ladder Bottom",
        "explanation": "Three down candles followed by a strong reversal candle — a multi-day bottoming sequence.",
    },
    "longleggeddoji": {
        "label": "Long-Legged Doji",
        "explanation": "A doji with long wicks on both sides — a wide-ranging, indecisive session.",
    },
    "longline": {
        "label": "Long Line Candle",
        "explanation": "An unusually long-bodied candle relative to recent price action — a decisive, high-conviction move.",
    },
    "marubozu": {
        "label": "Marubozu",
        "explanation": "A candle with no wicks — price only moved in one direction all session, showing strong conviction.",
    },
    "matchinglow": {
        "label": "Matching Low",
        "explanation": "Two down candles close at nearly the same price — a floor may be forming.",
    },
    "mathold": {
        "label": "Mat Hold",
        "explanation": "A strong trend candle followed by a few small pullback candles, then continuation — the trend pausing to catch its breath.",
    },
    "morningdojistar": {
        "label": "Morning Doji Star",
        "explanation": "A morning star where the middle candle is a doji — indecision at the bottom before a reversal up.",
    },
    "morningstar": {
        "label": "Morning Star",
        "explanation": "A strong down candle, a small-bodied pause, then a strong up candle — a classic bullish bottoming pattern.",
    },
    "onneck": {
        "label": "On Neck",
        "explanation": "A down candle followed by an up candle that closes right at the prior low — a very weak bounce likely to fail.",
    },
    "piercing": {
        "label": "Piercing Line",
        "explanation": "After a down candle, the next opens lower but closes more than halfway back up into the prior body — buyers regained control.",
    },
    "rickshawman": {
        "label": "Rickshaw Man",
        "explanation": "A long-legged doji with the body sitting near the middle of its range — deep indecision.",
    },
    "risefall3methods": {
        "label": "Rising/Falling Three Methods",
        "explanation": "A strong trend candle, a few small pullback candles that stay inside its range, then a continuation candle — trend intact.",
    },
    "separatinglines": {
        "label": "Separating Lines",
        "explanation": "A candle against the trend is immediately followed by a candle opening at the same price and resuming the trend.",
    },
    "shootingstar": {
        "label": "Shooting Star",
        "explanation": "A small body near the bottom with a long upper wick after an uptrend — buyers pushed higher but sellers took back control.",
    },
    "shortline": {
        "label": "Short Line Candle",
        "explanation": "An unusually short-bodied candle relative to recent price action — low conviction, a quiet session.",
    },
    "spinningtop": {
        "label": "Spinning Top",
        "explanation": "A small body with wicks on both sides of similar length — balanced tug-of-war, often a pause before continuation or reversal.",
    },
    "stalledpattern": {
        "label": "Stalled Pattern",
        "explanation": "Similar to three white soldiers, but the last candle's small body and long upper wick show the rally stalling.",
    },
    "sticksandwich": {
        "label": "Stick Sandwich",
        "explanation": "Two down candles with an up candle between them that closes at the same level — a support level holding twice.",
    },
    "takuri": {
        "label": "Takuri Line",
        "explanation": "An extreme dragonfly doji with a very long lower wick — a sharp intraday sell-off fully recovered by the close.",
    },
    "tasukigap": {
        "label": "Tasuki Gap",
        "explanation": "A trend candle gaps, then a pullback candle only partially fills the gap — the gap is likely to hold and the trend to continue.",
    },
    "thrusting": {
        "label": "Thrusting",
        "explanation": "After a down candle, the next opens lower but closes just into the prior body without reclaiming its midpoint — a weak bounce.",
    },
    "tristar": {
        "label": "Tri-Star",
        "explanation": "Three consecutive doji, with the middle one gapping away from the other two — rare, strong indecision at an extreme.",
    },
    "unique3river": {
        "label": "Unique Three River",
        "explanation": "A three-candle bottoming pattern ending in a small candle that fails to make a new low — selling pressure exhausted.",
    },
    "upsidegap2crows": {
        "label": "Upside Gap Two Crows",
        "explanation": "After an up candle, two down candles gap up and then close back inside the original body — an uptrend losing momentum.",
    },
    "xsidegap3methods": {
        "label": "Upside/Downside Gap Three Methods",
        "explanation": "A trend candle gaps, then is fully filled by the next candle — the gap acted as a brief pause, not a reversal.",
    },
}
