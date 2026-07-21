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
    },
]


def seed_lessons(db: Session) -> None:
    """Idempotently ensure the 9-lesson curriculum exists."""
    existing_orders = {row[0] for row in db.query(Lesson.order).all()}
    for lesson in LESSONS:
        if lesson["order"] not in existing_orders:
            db.add(Lesson(**lesson))
    db.commit()
