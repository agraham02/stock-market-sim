from sqlalchemy.orm import Session

from app.models.lesson import Lesson

LESSONS: list[dict] = [
    {
        "title": "What a Stock Is / How Price Moves",
        "order": 1,
        "content_md": """\
A share of stock is a small piece of ownership in a company. When you buy one, you own that
fraction of the business — its future profits (or losses) are, in tiny proportion, yours.

**Why the price moves at all**: a stock's price is just the most recent price someone was willing
to pay and someone else was willing to accept. It moves because the balance between buyers and
sellers shifts, and that balance shifts because of *new information* — an earnings report, a
product launch, a Fed announcement, a competitor's news, or just enough traders changing their mind
about what the company is worth.

**The core idea to internalize**: price moves are driven by *changes in expectations*, not by
absolute good or bad news. A company can report record profits and still drop 10% if traders
expected even more. This single idea — it's the surprise relative to expectations that moves price,
not the news in isolation — is the seed of almost everything else in this app, especially implied
volatility (Lesson 5) and reading catalysts (Lesson 9).

**What you'll do with this**: every symbol view in this app starts with a price chart. Before you
ever place a trade, get in the habit of asking "what changed recently, and was it a surprise?"
before you ask "which direction do I think this goes?"
""",
        "quiz_json": [
            {
                "id": "l1-q1",
                "prompt": "A company reports record profits, but the stock drops 10% that day. What's the most likely explanation?",
                "choices": [
                    {"id": "a", "text": "The market is irrational and this shouldn't happen", "correct": False, "explanation": "It can feel that way, but price moves on surprise relative to expectations, not on absolute good/bad news — this is entirely explainable."},
                    {"id": "b", "text": "Traders expected even better results than what was reported", "correct": True, "explanation": "Exactly — it's the surprise relative to expectations that moves price, not the news in isolation."},
                    {"id": "c", "text": "The report must have contained a typo", "correct": False, "explanation": "Possible in theory, but not the general lesson here — expectations, not literal errors, drive this pattern."},
                ],
            },
            {
                "id": "l1-q2",
                "prompt": "What actually causes a stock's price to move?",
                "choices": [
                    {"id": "a", "text": "A government committee resets it daily", "correct": False, "explanation": "No official body sets stock prices — they're set by trading."},
                    {"id": "b", "text": "The balance between buyers and sellers shifting, driven by new information", "correct": True, "explanation": "Right — price is just the most recent price a buyer and seller agreed on, and that agreement point shifts as information changes."},
                    {"id": "c", "text": "The company's CEO decides on a target price", "correct": False, "explanation": "Companies don't set their own stock price — the market does, trade by trade."},
                ],
            },
        ],
    },
    {
        "title": "Candlesticks — Reading a Single Candle, Then Patterns",
        "order": 2,
        "content_md": """\
A candlestick packs four numbers from one time period (a day, in this app) into one shape:

- **Open** — the price when the period started
- **Close** — the price when the period ended
- **High** — the highest price reached during the period
- **Low** — the lowest price reached during the period

The thick part (the "body") spans open to close. If close is above open, the app colors it green
(price rose that day); if close is below open, it's red (price fell). The thin lines above and
below the body (the "wicks") show the high and low — how far price wandered before settling back.

**Why the shape matters**: a long body means one side (buyers or sellers) was in control the whole
period. A small body with long wicks on both sides means neither side won — a tug-of-war, often
right before a change in direction. A long wick with almost no body on the opposite end (a
*hammer* or *shooting star*) means one side tried hard to push price somewhere and got firmly
rejected.

**In this app**: the Symbol view detects real candlestick patterns automatically (62 of them) and
marks them directly on the chart with a plain-language explanation in the side panel — you don't
need to memorize shapes, but understanding *why* a doji means indecision and a hammer means a
rejected sell-off will make those callouts mean something instead of just being labels.
""",
        "walkthrough_json": [
            {
                "id": "lesson-2-chart",
                "path": "/symbol/SPY",
                "target": '[data-tour="symbol-chart"]',
                "title": "Here's a real candlestick chart",
                "description": "Each candle is one day: open, close, high, low. Green means the close was above the open; red means below.",
                "side": "right",
            },
            {
                "id": "lesson-2-patterns",
                "target": '[data-tour="symbol-patterns"]',
                "title": "Patterns, detected automatically",
                "description": "Every pattern found on this chart is listed here in plain language. Hover one to see exactly where it fired.",
                "side": "left",
            },
        ],
        "quiz_json": [
            {
                "id": "l2-q1",
                "prompt": "A candle has a small body with long wicks on both the top and bottom. What does that generally signal?",
                "choices": [
                    {"id": "a", "text": "Strong, one-sided conviction", "correct": False, "explanation": "That's what a long body means — a small body with long wicks both ways is closer to the opposite."},
                    {"id": "b", "text": "Indecision — neither buyers nor sellers won", "correct": True, "explanation": "Right — a tug-of-war candle like this often shows up right before a change in direction."},
                    {"id": "c", "text": "Guaranteed continuation of the current trend", "correct": False, "explanation": "Nothing is guaranteed, and this specific shape actually leans the other way — toward indecision, not continuation."},
                ],
            },
            {
                "id": "l2-q2",
                "prompt": "If a daily candle closes below where it opened, how does this app color it?",
                "choices": [
                    {"id": "a", "text": "Red", "correct": True, "explanation": "Correct — close below open means price fell that day, shown in red."},
                    {"id": "b", "text": "Green", "correct": False, "explanation": "Green means the close was above the open (price rose) — this candle closed lower."},
                    {"id": "c", "text": "Blue", "correct": False, "explanation": "This app only uses green (up) and red (down) for candle bodies."},
                ],
            },
        ],
    },
    {
        "title": "What an Option Is — Premium, Strike, Expiration, ITM/OTM/ATM",
        "order": 3,
        "content_md": """\
An option is a contract that gives you the *right, but not the obligation*, to buy or sell 100
shares of a stock at a fixed price (the **strike**), by a fixed date (the **expiration**). You pay
an upfront price for that right — the **premium** — which is what you see as the bid/ask in an
options chain.

Three terms describe where the strike sits relative to the current stock price:

- **ITM (in the money)** — the option already has intrinsic value if exercised right now (a call
  with a strike below the current price, or a put with a strike above it).
- **OTM (out of the money)** — the option has no intrinsic value yet; it's purely a bet on getting
  there before expiration.
- **ATM (at the money)** — the strike is essentially equal to the current price.

**Why premium isn't just "how much it costs"**: the premium is made of two components — *intrinsic
value* (what it's worth if exercised today) and *time value* (what someone will pay for the
chance it becomes worth more before expiration). Time value shrinks every single day, faster as
expiration approaches — that's **theta decay**, covered properly in Lesson 6.

**In this app**: the Options Chain on every Symbol view lists every strike/expiration with live
bid/ask, and highlights ITM contracts. When you place a trade, the ticket asks for strike and
expiration explicitly — those two numbers are the entire shape of your bet.
""",
        "walkthrough_json": [
            {
                "id": "lesson-3-chain",
                "path": "/symbol/SPY",
                "target": '[data-tour="symbol-options"]',
                "title": "The options chain",
                "description": "Every strike and expiration, with live bid/ask. ITM contracts are highlighted. Click a price to open the trade ticket.",
                "side": "top",
            },
        ],
        "quiz_json": [
            {
                "id": "l3-q1",
                "prompt": "A call option's strike is $50 and the stock is trading at $45. Is this call ITM, OTM, or ATM?",
                "choices": [
                    {"id": "a", "text": "ITM (in the money)", "correct": False, "explanation": "A call is ITM when the strike is below the current price — here the strike ($50) is above it."},
                    {"id": "b", "text": "OTM (out of the money)", "correct": True, "explanation": "Right — the stock ($45) hasn't reached the strike ($50) yet, so this call has no intrinsic value yet."},
                    {"id": "c", "text": "ATM (at the money)", "correct": False, "explanation": "ATM means the strike and stock price are essentially equal — these are $5 apart."},
                ],
            },
            {
                "id": "l3-q2",
                "prompt": "What are the two components that make up an option's premium?",
                "choices": [
                    {"id": "a", "text": "Intrinsic value and time value", "correct": True, "explanation": "Correct — what it's worth if exercised today, plus what someone will pay for the chance it's worth more before expiration."},
                    {"id": "b", "text": "Strike price and expiration date", "correct": False, "explanation": "Those define the contract, but they aren't the two components of the premium itself."},
                    {"id": "c", "text": "Bid price and ask price", "correct": False, "explanation": "Bid/ask are where the premium is quoted, not what the premium is made of."},
                ],
            },
        ],
    },
    {
        "title": "Calls vs. Puts — the Directional Bet Framework",
        "order": 4,
        "content_md": """\
- A **call** gives you the right to *buy* at the strike price. You buy a call when you expect the
  stock to go **up** — its value rises as the stock price rises above your strike.
- A **put** gives you the right to *sell* at the strike price. You buy a put when you expect the
  stock to go **down** — its value rises as the stock price falls below your strike.

Buying either one costs you the premium up front, and — this is the part that trips people up —
**premium is all you can lose**. Unlike shorting a stock, buying a put has strictly limited downside
(the premium paid), because you're not obligated to do anything; you're buying a right.

**The trap**: it's tempting to think "I'll buy calls when things look good and puts when they look
bad," but that's not a thesis, it's a coin flip with extra steps. A real thesis names the catalyst
(Lesson 9), states a direction *and why*, and — critically — sizes the expected move against what
the market has already priced in (Lesson 5). That's exactly what this app's Decision Framework
ticket requires before every trade: catalyst, direction, expected magnitude, timeframe, and your
own confidence. Filling it out honestly is the actual skill this whole app is built to teach.

**In this app**: when you buy a call or put here, the ticket auto-fills your direction based on
which one you picked (up for calls, down for puts) — you can override it, but if you find yourself
overriding it often, that's worth pausing on.
""",
        "quiz_json": [
            {
                "id": "l4-q1",
                "prompt": "You buy a put and the stock goes up instead of down. What's the most you can lose?",
                "choices": [
                    {"id": "a", "text": "Unlimited — like a naked short position", "correct": False, "explanation": "That's the risk profile of actually shorting a stock, not of buying a put — buying only ever risks what you paid."},
                    {"id": "b", "text": "The premium you paid, nothing more", "correct": True, "explanation": "Right — buying a put costs you the premium up front, and that's the maximum loss since you're not obligated to do anything."},
                    {"id": "c", "text": "You owe the difference between the strike and the stock price", "correct": False, "explanation": "You're never obligated to exercise a long option — worst case you just let it expire worthless."},
                ],
            },
            {
                "id": "l4-q2",
                "prompt": "\"I'll buy a call because things look good\" — what's missing from this as a trade thesis?",
                "choices": [
                    {"id": "a", "text": "Nothing, that's a complete thesis", "correct": False, "explanation": "This is closer to a coin flip with extra steps than a real thesis — the Decision Framework asks for more, deliberately."},
                    {"id": "b", "text": "A named catalyst, a stated why, and an expected magnitude vs. what IV already prices in", "correct": True, "explanation": "Exactly — catalyst, direction and why, magnitude vs. IV, and timeframe are what turn a vibe into an actual thesis."},
                    {"id": "c", "text": "A louder conviction level", "correct": False, "explanation": "Confidence is one input the app tracks, but it doesn't substitute for naming a real catalyst and reasoning."},
                ],
            },
        ],
    },
    {
        "title": "Implied Volatility — the Market Has Already Priced In a Move",
        "order": 5,
        "content_md": """\
**Implied volatility (IV)** is the market's own estimate — baked into the option's price — of how
much the stock is likely to move before expiration. It's not a guess you make; it's a number
derived backward from what people are actually paying for the option right now.

Here is the single most important idea in this entire app, repeated because it is the one that
actually separates people who lose money on "correct" trades from people who don't:

> **The market has already priced in a move. Buying an option is a bet that the real move will be
> *bigger* than what IV already assumes — not just a bet on direction.**

This is why "I was right about direction and still lost money" happens constantly to people
trading options, especially short-dated ones around earnings. If IV already prices in a 6% move
and the stock moves exactly 6% in your predicted direction, the option may not gain much — because
nothing *surprised* the market. You needed a bigger-than-priced-in move, or a faster one, to profit.

**In this app**: every options chain shows the IV for each contract. The Decision Framework ticket
puts your expected move (as a %) right next to it, specifically so you compare the two *before*
placing the trade instead of finding out the hard way. After the trade closes, the Journal grades
this exact failure mode separately — it's called "IV crush" there, and it's graded independently
from whether your direction call was right.
""",
        "quiz_json": [
            {
                "id": "l5-q1",
                "prompt": "IV on a stock's options is pricing in a 6% move before earnings. The stock moves exactly 6% in the direction you predicted. What happens to your option's value?",
                "choices": [
                    {"id": "a", "text": "It gains a large amount, since your direction call was right", "correct": False, "explanation": "Being directionally right isn't enough — since the move matched what was already priced in, there was no surprise left to pay for."},
                    {"id": "b", "text": "It may barely gain, or even lose value, because nothing surprised the market", "correct": True, "explanation": "Right — you needed a bigger-than-priced-in move (or a faster one) to profit, not just the right direction."},
                    {"id": "c", "text": "Its value is unaffected by IV once the stock actually moves", "correct": False, "explanation": "IV is baked into the price the whole time — it doesn't stop mattering once the stock moves, especially right after a catalyst resolves."},
                ],
            },
            {
                "id": "l5-q2",
                "prompt": "Where does implied volatility actually come from?",
                "choices": [
                    {"id": "a", "text": "It's set by the exchange as a fixed rule", "correct": False, "explanation": "Exchanges don't set IV — it emerges from actual trading."},
                    {"id": "b", "text": "It's derived backward from what people are actually paying for the option right now", "correct": True, "explanation": "Correct — IV isn't a guess you make, it's the market's own estimate baked into the live option price."},
                    {"id": "c", "text": "It's the company's own forecast of its stock's volatility", "correct": False, "explanation": "Companies don't publish this — IV comes from the options market itself, not company guidance."},
                ],
            },
        ],
        "scenario_json": {
            "start": "n1",
            "nodes": {
                "n1": {
                    "prompt": "Earnings are tomorrow. IV on your target's near-term options is already elevated, pricing in roughly a 7% move. You're confident the stock will move — what do you do?",
                    "choices": [
                        {"text": "Buy calls now, before earnings, since I'm confident it'll go up", "next": "n2", "outcome": None},
                        {"text": "Check whether my expected move is actually bigger than what's priced in first", "next": "n3", "outcome": None},
                        {"text": "Wait until after earnings to see the reaction, then trade the follow-through", "next": "n4", "outcome": None},
                    ],
                },
                "n2": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "Say the stock moves up exactly 7% — right in line with what IV already priced in. Because nothing surprised the market, IV crushes right after the print regardless of direction, and that crush can eat most or all of your gain. Being right on direction isn't the same as being right on magnitude — this is the exact IV crush pattern from this lesson.",
                },
                "n3": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "This is the move that actually protects you. If you believe the real move will be meaningfully bigger than ~7% (or faster than the market expects), the trade has real edge. If your honest expectation is close to 7%, the smarter play is to sit out or size down, since IV crush eats the gain either way.",
                },
                "n4": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "A reasonable alternative: post-earnings IV has already crushed, so you're no longer fighting it — you're trading the stock's actual new information at a fairer price. You give up the chance to catch the initial gap, but you sidestep the crush risk entirely.",
                },
            },
        },
    },
    {
        "title": "Greeks Basics — Delta and Theta First",
        "order": 6,
        "content_md": """\
The "Greeks" measure how an option's price reacts to different changes. Two matter most when
you're starting out:

- **Delta** — roughly, how much the option's price moves for every $1 move in the stock. A delta
  of 0.50 means the option gains about $0.50 for every $1 the stock rises. Delta also roughly
  approximates the odds the option finishes in the money — a 0.30 delta call is, loosely, priced
  as if it has about a 30% chance of being ITM at expiration. Calls have positive delta (0 to 1),
  puts have negative delta (0 to -1).
- **Theta** — how much value the option loses *per day* just from time passing, holding everything
  else constant. Theta is always working against option buyers. It's small and steady far from
  expiration, and accelerates sharply in the final days — which is exactly what makes short-dated
  options (Lesson 7) feel so different to trade.

**Why these two first**: delta tells you how much the position actually behaves like the stock
itself (a deep ITM call with 0.90 delta moves almost dollar-for-dollar with the stock; a far OTM
call with 0.10 delta barely reacts at all). Theta tells you how much the clock itself is costing
you, independent of whether you're right. A trade can have the right delta-implied direction and
still bleed value every single day theta eats more than the stock moves in your favor.

**In this app**: full Greeks (including gamma and vega) come as Phase 2 depth — for now, treat
strike selection and days-to-expiration as your rough proxies for delta and theta exposure: closer
strikes and shorter expirations mean higher delta sensitivity and faster theta decay, both at once.
""",
        "quiz_json": [
            {
                "id": "l6-q1",
                "prompt": "A call option has a delta of 0.30. Roughly what does that tell you?",
                "choices": [
                    {"id": "a", "text": "It gains about $0.30 for every $1 the stock rises, and is priced as if it has roughly a 30% chance of finishing ITM", "correct": True, "explanation": "Correct — delta does double duty as a rough price-sensitivity measure and a rough probability-of-ITM estimate."},
                    {"id": "b", "text": "It will definitely expire in the money", "correct": False, "explanation": "A 0.30 delta is a rough ~30% odds estimate, not a guarantee — it's still more likely than not to expire OTM."},
                    {"id": "c", "text": "It loses $0.30 in value per day from theta", "correct": False, "explanation": "That describes theta, a different Greek — delta is about sensitivity to the stock's price, not the passage of time."},
                ],
            },
            {
                "id": "l6-q2",
                "prompt": "Theta decay behaves how as expiration approaches?",
                "choices": [
                    {"id": "a", "text": "It stays constant the whole life of the option", "correct": False, "explanation": "It's small and steady far from expiration, but that's not the whole picture — it changes sharply later on."},
                    {"id": "b", "text": "It accelerates sharply in the final days before expiration", "correct": True, "explanation": "Right — this is exactly what makes short-dated (0-2 DTE) options feel so different to trade, covered next in Lesson 7."},
                    {"id": "c", "text": "It slows down as expiration approaches", "correct": False, "explanation": "The opposite is true — theta decay speeds up, not down, in the final stretch."},
                ],
            },
        ],
    },
    {
        "title": "Short-Dated (0-2 DTE) Mechanics — Theta Decay and Gamma Risk Made Visible",
        "order": 7,
        "content_md": """\
DTE means "days to expiration." A 0-2 DTE option expires today, tomorrow, or the day after — this
is exactly the style of trading that motivated this whole app: fast, news-driven, high-adrenaline,
and genuinely dangerous to learn on with real money.

Two things compress hard as expiration approaches:

- **Theta decay accelerates**: an option loses time value slowly when expiration is weeks away, but
  in the final 1-2 days that decay is steep and constant, hour by hour. Holding a losing short-dated
  option and hoping is usually just paying theta to find out you were wrong.
- **Gamma risk spikes**: gamma measures how fast *delta itself* changes as the stock moves. Close to
  expiration, gamma gets extreme — a contract that behaved mildly yesterday can double or evaporate
  today on a move that would have barely mattered a week out. This is why 0-2 DTE positions can
  swing so much faster than the underlying stock's own move would suggest.

**The honest takeaway**: 0-2 DTE options amplify everything — being right pays off fast and big,
being wrong costs fast and completely, and there is very little time for a wrong thesis to recover.
This isn't a reason to avoid them entirely; it's a reason the Decision Framework's timeframe
question ("does the expiration match when the move is expected?") matters most exactly here.

**In this app**: the Positions view flags days-to-expiration on every open position, and the risk
guardrail (Lesson 8) specifically calls out short-dated trades when sizing a position.
""",
        "walkthrough_json": [
            {
                "id": "lesson-7-positions",
                "path": "/positions",
                "target": '[data-tour="positions-table"]',
                "title": "Days-to-expiration, at a glance",
                "description": "Every open position shows how close it is to expiring — this is where theta decay and gamma risk stop being abstract.",
                "side": "top",
            },
        ],
        "quiz_json": [
            {
                "id": "l7-q1",
                "prompt": "Why do 0-2 DTE options swing so much faster than the underlying stock's own move would suggest?",
                "choices": [
                    {"id": "a", "text": "Gamma gets extreme close to expiration, so delta itself changes very fast as the stock moves", "correct": True, "explanation": "Correct — a contract that behaved mildly yesterday can double or evaporate today on a move that would have barely mattered a week out."},
                    {"id": "b", "text": "Short-dated options have wider bid/ask spreads, which causes the swings", "correct": False, "explanation": "Spreads affect trading cost, not the underlying speed of value swings — gamma risk is the real driver here."},
                    {"id": "c", "text": "Exchanges apply a volatility multiplier to short-dated contracts", "correct": False, "explanation": "There's no such multiplier — the effect comes from real options math (gamma), not an exchange rule."},
                ],
            },
            {
                "id": "l7-q2",
                "prompt": "You're holding a losing 0-2 DTE option and hoping it recovers before expiration. What does this lesson say that's usually doing?",
                "choices": [
                    {"id": "a", "text": "Giving you a fair chance to be proven right, at no extra cost", "correct": False, "explanation": "Time isn't free here — theta decay is steep and constant in the final 1-2 days, so waiting has a real cost."},
                    {"id": "b", "text": "Just paying theta to find out you were wrong", "correct": True, "explanation": "Right — this is the lesson's own framing, and it's exactly why the timeframe question in the Decision Framework matters most for short-dated trades."},
                    {"id": "c", "text": "Reducing your gamma risk the longer you hold", "correct": False, "explanation": "Gamma risk doesn't shrink as you wait it out this close to expiration — if anything it stays extreme or worsens."},
                ],
            },
        ],
        "scenario_json": {
            "start": "n1",
            "nodes": {
                "n1": {
                    "prompt": "You bought a 0DTE call this morning on a momentum breakout. It's now down 40% two hours before the close, with no news to explain the drop. What do you do?",
                    "choices": [
                        {"text": "Hold — it still has hours left and could snap back", "next": "n2", "outcome": None},
                        {"text": "Cut the loss now — the thesis (momentum continuation) hasn't played out and theta is accelerating", "next": "n3", "outcome": None},
                        {"text": "Average down by buying more at the lower price", "next": "n4", "outcome": None},
                    ],
                },
                "n2": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "It might snap back — but \"hours left\" on a 0DTE means theta and gamma are both at their most extreme, working against you the whole time you wait. Hoping isn't a plan; it's usually just paying theta to find out you were wrong, exactly as this lesson describes.",
                },
                "n3": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "This is the disciplined move. The original catalyst (momentum continuation) already failed to show up, and every hour you hold now is pure decay risk with no thesis behind it. Cutting losses when the thesis breaks — not when you feel like it — is the actual skill.",
                },
                "n4": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "Averaging down increases your position size on a thesis that has already stopped working, right when gamma and theta are both at their most dangerous. This is the position-sizing mistake Lesson 8 warns about, made worse by 0DTE timing.",
                },
            },
        },
    },
    {
        "title": "Position Sizing and Risk Management",
        "order": 8,
        "content_md": """\
The fastest way to turn a string of good decisions into a wipeout is sizing one trade too large.
Because options are leveraged (a small premium controls 100 shares), it's easy to put a much larger
fraction of your account at risk than it feels like you're risking.

A simple, durable rule: **decide what percentage of your total portfolio you're willing to lose on
a single idea before you look at the option's price**, not after. Many traders cap any single trade
at 5-10% of portfolio value, and cut that further for short-dated (0-2 DTE) positions, since those
can go to zero fastest.

This isn't about being timid — it's about surviving long enough for your edge (if you have one) to
show up over many trades instead of one bad trade ending the experiment. Being right 60% of the
time is a great edge; being right 60% of the time while risking 50% of your account on the 40% is
still a losing strategy.

**In this app**: every trade ticket checks the cost against your current portfolio value and shows
a soft warning above the configured threshold (default 5-10%), with an extra note when the position
is also short-dated. It won't block the trade — the point is building the habit of noticing, the
same way you'd want to notice with real money, before it's real money.
""",
        "quiz_json": [
            {
                "id": "l8-q1",
                "prompt": "Why can being right 60% of the time still be a losing strategy?",
                "choices": [
                    {"id": "a", "text": "60% isn't actually a real edge", "correct": False, "explanation": "60% is a genuinely good edge — the problem this lesson describes isn't the win rate, it's sizing."},
                    {"id": "b", "text": "If you risk too much on the losing 40%, those losses can outweigh or wipe out the gains from being right", "correct": True, "explanation": "Correct — an edge only compounds into long-term gains if position sizing lets you survive the losing trades along the way."},
                    {"id": "c", "text": "Options always expire worthless regardless of win rate", "correct": False, "explanation": "That's not true, and it's not the point of this lesson — the issue is risk sizing, not some fixed rule about expiration."},
                ],
            },
            {
                "id": "l8-q2",
                "prompt": "When should you decide what percentage of your portfolio to risk on a trade?",
                "choices": [
                    {"id": "a", "text": "After seeing the option's price, so you know exactly what you're paying", "correct": False, "explanation": "This is the trap the lesson warns about — deciding after you've seen the price tends to anchor you to what feels affordable, not what's actually safe."},
                    {"id": "b", "text": "Before looking at the option's price", "correct": True, "explanation": "Right — decide your risk tolerance for the idea first, independent of the price, so the price doesn't quietly talk you into oversizing."},
                    {"id": "c", "text": "Only after the position is already losing money", "correct": False, "explanation": "By then you're reacting, not sizing — the whole point is deciding position size before you're in the trade."},
                ],
            },
        ],
        "scenario_json": {
            "start": "n1",
            "nodes": {
                "n1": {
                    "prompt": "You have a $100,000 paper portfolio and a strong, well-researched thesis on a 0-2 DTE momentum trade. How much do you put into this single trade?",
                    "choices": [
                        {"text": "$40,000 — I'm very confident, so I should size up to match", "next": "n2", "outcome": None},
                        {"text": "$5,000-$8,000, cut down from my normal size because it's short-dated", "next": "n3", "outcome": None},
                        {"text": "Whatever the option happens to cost for the number of contracts that feels right", "next": "n4", "outcome": None},
                    ],
                },
                "n2": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "High confidence doesn't change the math: a 0-2 DTE position can go to zero fastest, and 40% of the portfolio on one idea means one wrong short-dated trade could be catastrophic. Confidence should inform the thesis, not override the sizing cap.",
                },
                "n3": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "This matches the lesson's guidance directly: cap around 5-10% of portfolio value on a single idea, and cut further for short-dated positions since they can go to zero fastest. This is what lets a real edge survive long enough to show up.",
                },
                "n4": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "This is deciding size backward — letting the option's price and a vague number of contracts determine your risk, instead of deciding your risk tolerance first and letting that determine the position. Easy to accidentally oversize this way.",
                },
            },
        },
    },
    {
        "title": "Reading News/Catalysts — Earnings, FDA, Fed Events, and Where IV Crush Comes From",
        "order": 9,
        "content_md": """\
A **catalyst** is the specific reason you expect a stock to move — not a vibe, a named, dated
event. Common catalyst types:

- **Earnings** — quarterly results, released on a known date. The single most common source of
  large, fast options-relevant moves.
- **News** — a specific headline: a lawsuit, a product recall, a leadership change, an analyst
  upgrade/downgrade.
- **FDA/regulatory decisions** — binary, all-or-nothing catalysts common in biotech; moves are
  often extreme in both directions.
- **Fed/macro events** — rate decisions, inflation prints, jobs reports — these move nearly every
  stock at once, not just one company.
- **Technical setup / momentum** — no scheduled event, just price action itself (a breakout, a
  support/resistance test) suggesting a move.

**Where IV crush actually comes from**: ahead of a known, dated catalyst like earnings, IV rises for
weeks as uncertainty builds — everyone knows a big move is coming, they just don't know which way,
so options get expensive. The moment the event happens and the uncertainty resolves, IV collapses
immediately, *regardless of which way the stock moved*. This collapse is "IV crush," and it's why
a trader can correctly predict the direction of an earnings move and still lose money on the
option — the crush in IV can outweigh the gain from being right, especially if the actual move
undershoots what was priced in (Lesson 5, again — this is the same idea from the other side).

**In this app**: the Symbol view's news/catalyst panel surfaces headlines and the earnings calendar
so the "catalyst" field in your Decision Framework ticket names something real, not a guess — and
the Journal's IV-crush grade is specifically checking for this exact pattern after the fact.
""",
        "walkthrough_json": [
            {
                "id": "lesson-9-catalysts",
                "path": "/symbol/SPY",
                "target": '[data-tour="symbol-catalysts"]',
                "title": "Real catalysts, not guesses",
                "description": "Recent headlines, the upcoming earnings date, and an on-demand sentiment pull — this is what should back the \"catalyst\" field on your trade ticket.",
                "side": "top",
            },
        ],
        "quiz_json": [
            {
                "id": "l9-q1",
                "prompt": "Why does IV typically rise for weeks before a known catalyst like earnings, then collapse the moment it happens?",
                "choices": [
                    {"id": "a", "text": "Because everyone knows a big move is coming but not which direction, so uncertainty (and option prices) build until the event resolves it", "correct": True, "explanation": "Correct — the moment the event happens and uncertainty resolves, IV collapses immediately regardless of which way the stock moved."},
                    {"id": "b", "text": "Because trading volume always drops right before earnings", "correct": False, "explanation": "Volume patterns vary, but that's not what drives the IV buildup-and-crush pattern described in this lesson."},
                    {"id": "c", "text": "Because exchanges manually adjust IV ahead of scheduled events", "correct": False, "explanation": "IV isn't manually set by exchanges — it emerges from real options trading, reflecting genuine uncertainty."},
                ],
            },
            {
                "id": "l9-q2",
                "prompt": "Which of these is a \"named, dated\" catalyst, as opposed to a vague vibe?",
                "choices": [
                    {"id": "a", "text": "\"This stock feels like it's about to move\"", "correct": False, "explanation": "This is exactly the kind of vibe-based reasoning a real catalyst is supposed to replace."},
                    {"id": "b", "text": "\"Earnings release next Tuesday after market close\"", "correct": True, "explanation": "Right — a specific, dated event like this is a real catalyst you can size a thesis and timeframe around."},
                    {"id": "c", "text": "\"The stock has been going up lately so it'll probably keep going\"", "correct": False, "explanation": "This is closer to unexplained momentum than a named catalyst — it doesn't point to a specific reason or date."},
                ],
            },
        ],
        "scenario_json": {
            "start": "n1",
            "nodes": {
                "n1": {
                    "prompt": "You see a stock up 4% today with no earnings, no news headline, and no scheduled event — just steady buying all morning. How do you fill out the \"catalyst\" field on your trade ticket?",
                    "choices": [
                        {"text": "Pick \"earnings\" anyway since that's the most common catalyst type", "next": "n2", "outcome": None},
                        {"text": "Pick \"technical setup / momentum\" and be honest that there's no scheduled event backing this", "next": "n3", "outcome": None},
                        {"text": "Check the news/catalyst panel first in case there's a headline you missed, before deciding", "next": "n4", "outcome": None},
                    ],
                },
                "n2": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "Naming a catalyst that isn't actually happening defeats the whole point of the Decision Framework — the Journal will grade your IV-crush and catalyst reasoning against something that was never real, making the feedback meaningless.",
                },
                "n3": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "This is the honest answer if nothing else explains the move — momentum/technical setups are a legitimate catalyst type, and naming it accurately (rather than inventing a fake earnings catalyst) is what makes your later grading meaningful.",
                },
                "n4": {
                    "prompt": None,
                    "choices": [],
                    "outcome": "The best first move. The whole point of the catalyst panel is to check the stated catalyst against what the news actually shows, not take your own first impression on faith — if nothing turns up, \"technical setup / momentum\" becomes the honest answer.",
                },
            },
        },
    },
]


# Optional per-lesson content that's authored incrementally over time (walkthroughs, quizzes,
# scenarios). Listed here so seed_lessons() can backfill it onto already-seeded rows below.
OPTIONAL_CONTENT_KEYS = ("walkthrough_json", "quiz_json", "scenario_json")


def seed_lessons(db: Session) -> None:
    """Idempotently ensure the 9-lesson curriculum exists, and backfill any newly-authored
    optional content (see OPTIONAL_CONTENT_KEYS) onto rows that were already seeded — inserting
    a lesson only sets its columns once, so content added to LESSONS later wouldn't otherwise
    reach rows created by a previous run. Only fills currently-NULL columns; never overwrites."""
    existing = {row.order: row for row in db.query(Lesson).all()}
    for lesson in LESSONS:
        if lesson["order"] not in existing:
            db.add(Lesson(**lesson))
            continue
        row = existing[lesson["order"]]
        for key in OPTIONAL_CONTENT_KEYS:
            if key in lesson and getattr(row, key) is None:
                setattr(row, key, lesson[key])
    db.commit()
