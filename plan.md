# Options & Stock Market Learning Simulator — Final Plan

## Vision

A local, paper-money platform whose real purpose is teaching *decision-making* in options trading — why a call instead of a put, why this expiration, why now — not just simulating fills. Secondary goal: general market literacy (candlestick charts, catalysts/news, risk management), taught inside the app rather than requiring outside study time.

Motivating scenario: friends trade very short-dated options (expiring in a day or two) off news/momentum. The goal is to understand that reasoning well enough to do independent research and make informed decisions — without risking real money while learning.

## What "Done" Looks Like for v1

You can open the app, look at a symbol's chart, get the candlestick patterns on it explained, see a news catalyst, fill out a Decision Framework ticket for a call or put, place the paper trade, watch it decay/move in real time (especially if short-dated), let it expire or close it, and then read a graded journal entry that tells you specifically whether your direction, magnitude, timing, and IV read were right — with an AI tutor available at every step to answer "wait, why did that happen?" That loop, run 20-30 times, should teach more than a week of scattered YouTube videos.

## Inspiration Scan — What to Borrow, What to Skip

Researched the two dominant paper-trading platforms:

- **thinkorswim paperMoney** (Schwab): the realism gold standard — full options chains, live Greeks, multi-leg entry, assignment/exercise simulation, $100k virtual buying power. Steep learning curve; it teaches *mechanics*, not *reasoning*. **Borrow:** the $100k default virtual balance (industry-standard reference point), the depth target for Phase 2. **Skip:** its complexity-first UI — we front-load reasoning, not order-entry mechanics.
- **Investopedia Stock Simulator**: browser-based, teaches concepts *as you encounter them* in practice, community leaderboards. **Borrow:** exactly the "learn in context" philosophy already baked into this plan's Learn Hub. **Skip:** leaderboards/social features — this is a single-user tool, not a competition.

Net takeaway: default starting paper balance of **$100,000** (user-adjustable), and keep validating that every feature teaches *why*, not just *how*.

## Architecture Overview

```
Next.js Frontend (Tailwind CSS, shadcn/ui, motion.dev, TanStack Query, Zustand)
  charts: TradingView lightweight-charts (candlesticks), shadcn chart/Recharts (P&L analytics)
        |  REST calls
        v
FastAPI Backend  <---->  PostgreSQL (Dockerized) via SQLAlchemy/Alembic
                          (Portfolio, Position, Trade, JournalEntry, Lesson, ChatMessage)
        |
        +-- Market Data Layer
        |     +-- Tradier sandbox API   (primary: quotes, options chains, paper order execution)
        |     +-- yfinance                (fallback: extra historical OHLC where Tradier is thin)
        |     +-- pandas-ta-classic       (candlestick pattern detection on cached OHLC, local/free)
        |     +-- py_vollib               (Black-Scholes Greeks & IV, Phase 2)
        |
        +-- News/Catalyst Layer
        |     +-- Finnhub                 (primary: headlines, earnings calendar, generous free tier)
        |     +-- Alpha Vantage News/Sentiment (supplemental: per-article sentiment scores, tightly rate-limited)
        |
        +-- AI Tutor Layer (provider-agnostic interface)
              +-- Gemini 2.5 Flash (default)
              +-- Claude Haiku 4.5 (alternate — you already have Anthropic access)
              +-- Local model via Ollama (Phase 3 — offline/zero-cost)
```

## Data & Third-Party Services (researched, concrete choices)

**Market data & paper order execution — Tradier (primary)**
Tradier offers a free developer sandbox (`sandbox.tradier.com/v1`) purpose-built for exactly this: delayed market data, real options chains, and a paper trading brokerage account with genuine order/position/balance semantics. This is a big upgrade over hand-rolling a fill simulator — it's an actual paper brokerage. Requires a free Tradier account + sandbox token.
*Fallback:* `yfinance` for extra historical OHLC data or symbols Tradier covers thinly — no signup required, good for the candlestick/charting layer specifically.

**Candlestick pattern detection — pandas-ta-classic**
62 native candlestick patterns (doji, engulfing, hammer, etc.), pure Python, no TA-Lib C-library install headaches (a real pain point on Windows). Runs locally against cached OHLC data — no API cost.

**Options Greeks/IV (Phase 2) — py_vollib**
Standard Black-Scholes implementation for delta/theta/gamma/vega and IV back-out, used when Tradier's own Greeks data is unavailable or for teaching-mode "what-if" recalculation.

**News/catalyst feed — Finnhub (primary) + Alpha Vantage (supplemental)**
- Finnhub free tier: 60 calls/min (~300/day practical usage), includes real-time-ish (20-min delayed) quotes, company news, earnings calendar — plenty for a per-symbol catalyst feed fetched on-demand rather than polled.
- Alpha Vantage News & Sentiment API gives per-article, per-ticker AI sentiment scores and years of earnings-call transcripts — excellent content, but free tier is capped at **25 requests/day**, so it's used sparingly: only when the user explicitly asks for a deeper "what's the sentiment on this catalyst" pull, cached aggressively once fetched.

## AI Tutor — Concrete Model Choice

| Model | Price (in/out per 1M tokens) | Notes |
|---|---|---|
| **Gemini 2.5 Flash** (default) | $0.30 / $2.50 | Cheapest of the hosted options; 1M token context; has built-in web search grounding for current-events questions |
| **Claude Haiku 4.5** (alternate) | $1.00 / $5.00 | Pricier per-token but you already have Anthropic access; Claude API also supports a server-side web search tool |
| **Local via Ollama** (Phase 3) | Free | Recommended models for laptop-class hardware: **Llama 3.2 3B** (best beginner, ~4GB RAM), **Phi-4-mini 3.8B** (best reasoning at low RAM, ~2.5GB), or **Gemma 3 2B** (fastest on CPU). Fully offline, no API cost, lower quality ceiling |

Built behind a small provider-agnostic interface so switching models is a config change. Start with Gemini Flash as default given cost; Haiku as a one-line swap since you already have access; local model added once the core loop is proven and cost/offline use becomes a real priority.

**Grounding:** tutor calls are injected with context automatically — current lesson, the specific trade/thesis/grade being discussed, or the candlestick pattern on screen — so answers are specific, not generic.

**Cost controls:** cap tokens per session, cache lesson content (never regenerate static text), and only hit the model for genuinely open-ended questions rather than anything answerable from stored lesson content.

## Feature Phases

### Phase 1 — Core Learning Loop (MVP)
- Paper portfolio via Tradier sandbox account: $100k default starting balance (adjustable).
- Symbol view: candlestick chart (`lightweight-charts`) with `pandas-ta-classic` pattern overlays, explained in plain language.
- Per-symbol news/catalyst panel (Finnhub headlines + earnings calendar; on-demand Alpha Vantage sentiment pull).
- Options chain viewer (Tradier real chains, calls/puts by strike/expiration).
- **Decision Framework trade ticket** (catalyst, direction, magnitude vs. IV, timeframe, confidence) required before any simulated trade.
- Simulated order placement through Tradier sandbox (market/limit, real bid/ask).
- Position tracking: P&L, cost basis, days to expiration.
- Expiration handling: auto-resolve ITM/OTM (Tradier sandbox handles this natively).
- **Trade Journal**: every trade stores its Decision Framework answers, auto-graded after close/expiration.
- Dashboard: portfolio P&L history, win rate, next lesson prompt.
- **Built-in curriculum (Learn Hub)** with 9 ordered lessons (below).
- **AI tutor chat**, contextual, Gemini Flash default.

### Phase 2 — Depth
- Full Greeks (delta/theta first, then gamma/vega), IV & IV rank, via Tradier data + `py_vollib` as backup.
- Payoff diagrams before placing a trade.
- Multi-leg strategies: covered calls, spreads, iron condors, builder UI.
- Assignment/exercise simulation refined using Tradier sandbox behavior.
- Dedicated **short-dated options (0-2 DTE) view**: real-time-feeling gamma/theta visualization so decay/whipsaw risk is visible and felt, safely — directly addressing the friends'-style trading that motivated this project.
- **Progress & Analytics dashboard**: a dedicated screen answering "am I actually getting better?" — see below.

### Phase 3 — Stretch
- Scenario replay against historical data.
- Expiration/theta-decay reminders.
- Side-by-side strategy comparison.
- Local LLM tutor option (Llama 3.2 3B / Phi-4-mini via Ollama) for fully offline use.
- **AI Trade Review (on-demand)**: qualitative AI grading of a closed trade, on top of the automatic quantitative grades — see below.

## The Decision Framework (core mechanic)

Every simulated trade requires, before submission:

1. **Catalyst** — what's driving this? (earnings, news, technical setup, momentum, macro event, none)
2. **Direction** — up or down, and why
3. **Magnitude** — expected move size vs. what IV is already pricing in (the #1 thing that kills "I was right but still lost money" trades)
4. **Timeframe** — does the expiration match when the move is expected?
5. **Confidence** — 1-5 self-rating

**Grading (after close/expiration):** direction correct? move big enough? timing right? and critically — even if right, did IV crush eat the gain anyway? That last failure mode is exactly what happens to people trading earnings/same-day options blind, and it's the single most valuable thing this app can teach.

## Risk Guardrails

Soft warning when a single trade — especially short-dated — would use more than a configurable threshold (default ~5-10%) of portfolio value, building the position-sizing habit before it's ever real money.

## Progress & Analytics (Phase 2)

The Dashboard's basic P&L/win-rate bullet (Phase 1) shows where you stand *right now*. This is the deeper, dedicated screen for whether the underlying decision-making is actually improving over the 20-30-trade arc the app is designed around — the P&L number alone can't answer that, since a lucky trade on a bad thesis looks identical to a good one in raw dollars.

- **Decision Framework accuracy over time**: rolling accuracy (e.g. trailing 10 trades) charted separately for each graded dimension — direction, magnitude, timing, IV crush — so it's visible *which specific skill* is or isn't improving, rather than one blended win rate hiding the difference between "wrong direction" and "right direction, wrong size."
- **Confidence calibration**: bucket closed trades by self-rated confidence (1-5) against actual win rate. A flat or inverted line (high confidence, mediocre results) surfaces overconfidence directly — this is the single most useful behavioral signal the Decision Framework's confidence field can produce, and it's invisible without tracking it explicitly.
- **Performance breakdowns**: win rate and average P&L sliced by catalyst type, option type (call/put), and DTE bucket (0-2 / 3-7 / 8+ days) — e.g. surfacing "profitable on earnings calls, but consistently losing on same-day momentum plays."
- **Portfolio value over time**: realized + mark-to-market unrealized value charted from periodic snapshots (see `PortfolioSnapshot` below), not reconstructed on the fly from trade replay.
- **Curriculum correlation**: simple before/after signal — e.g. IV-crush grade accuracy in the 10 trades before vs. after completing the IV lesson — to validate the Learn Hub content is actually landing.

All of this is derived from data already captured by the Decision Framework/Journal (M3) and Learn Hub (M4); the only new schema is `PortfolioSnapshot` for the value-over-time chart.

## AI Trade Review (Phase 3)

The Journal's automatic grades (M3) are deliberately mechanical — direction/magnitude/timing/IV-crush, computed from price data alone. They can't tell you *why* a thesis was right or wrong in a way that teaches something for next time (e.g. "you called it earnings-driven, but the actual move started two days before the print — that was sector rotation, not your catalyst"). This feature adds an on-demand, qualitative second pass from the same AI Tutor model (M5), specifically requested per trade rather than run automatically — consistent with the existing AI Tutor cost-control principle of only invoking the model for genuinely open-ended questions.

- **Trigger**: a "Ask AI to review this trade" action on a closed Journal entry. Never automatic/background — every call is a deliberate, user-initiated spend.
- **Context assembled server-side** from data already on hand plus one fresh pull:
  - The full JournalEntry (catalyst, direction, expected magnitude, IV at entry, rationale, confidence, the four quantitative grades).
  - The Position/Trade record (symbol, strike/expiration, entry/exit fills, realized P&L).
  - The underlying's OHLC across the trade's actual window (already cached via `QuoteCache`/`market_data`), so the model sees the real price path, not just entry/exit points.
  - Candlestick patterns detected in that window (reuse the existing `pandas-ta-classic` pipeline from M1).
  - Fresh news/catalyst context for that symbol and date range, pulled from Finnhub (and Alpha Vantage sentiment if the rate-limited quota allows) — so the model can check the stated catalyst against what the news actually shows, not just take the user's word for it.
- **Output**: a written qualitative review — where the stated thesis matches or diverges from what actually happened, and (when a knowledge gap is evident) a pointer back to the relevant Learn Hub lesson. Distinct from re-deriving the four boolean grades, which stay purely mechanical.
- **Storage**: persisted as a `ChatMessage` (`context_type="trade"`, `context_id` = the trade's id) — no new table, reusing the schema already defined for the AI Tutor.

## Built-in Curriculum (Learn Hub)

Short (5-10 min) lessons, surfaced contextually the first time relevant:

1. What a stock is / how price moves
2. Candlesticks — reading a single candle, then basic patterns
3. What an option is — premium, strike, expiration, ITM/OTM/ATM
4. Calls vs. puts — the directional bet framework
5. Implied volatility, one idea: "the market has already priced in a move — you're betting it's bigger than that"
6. Greeks basics — delta and theta first
7. Short-dated (0-2 DTE) mechanics — theta decay and gamma risk made visible
8. Position sizing and risk management
9. Reading news/catalysts — earnings, FDA, Fed events, and where IV crush comes from

## Screens

- Dashboard (portfolio value, P&L history, open positions, next lesson)
- Learn Hub (curriculum, progress, resource library, tutor chat entry point)
- Symbol view (candlestick chart + pattern callouts + news/catalyst feed)
- Option chain + Decision Framework trade ticket
- Positions (open positions, live gamma/theta view for short-dated ones)
- Journal (every trade: thesis, grade, notes, searchable/filterable)
- Progress (Phase 2: grading-accuracy trends, confidence calibration, performance breakdowns, curriculum correlation)

## Data Model (draft schema)

- **Portfolio**: `id`, `cash_balance`, `starting_balance`, `created_at`
- **Position**: `id`, `symbol`, `option_type` (call/put/none), `strike`, `expiration`, `quantity`, `entry_price`, `status` (open/closed/expired)
- **Trade**: `id`, `position_id`, `action` (open/close), `timestamp`, `fill_price`, `tradier_order_id`
- **JournalEntry**: `id`, `trade_id`, `catalyst`, `direction`, `expected_magnitude`, `iv_at_entry`, `timeframe_rationale`, `confidence`, `grade_direction`, `grade_magnitude`, `grade_timing`, `grade_iv_crush`, `notes`
- **Lesson**: `id`, `title`, `order`, `content_md`, `completed_at`
- **ChatMessage**: `id`, `role`, `content`, `context_type` (lesson/trade/symbol), `context_id`, `timestamp`
- **QuoteCache**: `symbol`, `ohlc_json`, `fetched_at` (to minimize API calls against rate limits)
- **PortfolioSnapshot** (Phase 2): `id`, `portfolio_id`, `timestamp`, `cash_balance`, `open_market_value`, `total_value` (written after every trade event and on a periodic tick, so the Progress screen can chart portfolio value over time without reconstructing history from trade replay)

## Tech Stack Summary

- **Backend:** Python (FastAPI)
- **Frontend:** Next.js, Tailwind CSS, shadcn/ui, motion.dev (animations)
  - `lightweight-charts` for candlestick charts (client component, `ssr:false`)
  - shadcn chart component (Recharts) for Dashboard P&L/analytics charts
  - TanStack Query for data fetching/caching/polling against the backend
  - React Hook Form + Zod for the Decision Framework trade ticket (shadcn form primitives already build on these)
  - Zustand for lightweight client state (active symbol/portfolio, chat panel)
  - next-themes for dark/light mode; date-fns for expiration/date math
- **Database:** PostgreSQL, run via Docker Compose (removes the host-install friction that was the only real downside vs. SQLite), accessed via SQLAlchemy + Alembic for migrations. Only Postgres is containerized for now — FastAPI (`uvicorn --reload`) and Next.js (`next dev`) run natively for the fastest edit/reload loop; full app containerization can be added later if/when this becomes hosted.
- **Market data & paper execution:** Tradier sandbox API, `yfinance` fallback
- **Pattern detection:** `pandas-ta-classic`
- **Greeks (Phase 2):** `py_vollib`
- **News/catalysts:** Finnhub (primary), Alpha Vantage News/Sentiment (supplemental, rate-limited)
- **AI tutor:** provider-agnostic interface — Gemini 2.5 Flash (default) / Claude Haiku 4.5 (alternate) / local Ollama model (Phase 3)
- **Live updates:** polling via TanStack Query (`refetchInterval`) rather than WebSockets — simpler, sufficient for a learning tool; revisit only if latency feels laggy
- **Hosting:** local only, simple start script

## Build Milestones

- **M0 — Setup:** repo scaffolding, FastAPI + Next.js skeleton, `docker-compose.yml` for Postgres, SQLAlchemy models + initial Alembic migration, Tradier sandbox account + token, Finnhub key.
- **M1 — Data & Charts:** pull quotes/OHLC (Tradier + yfinance fallback), render candlestick chart, wire up `pandas-ta-classic` pattern overlays.
- **M2 — Paper Trading Engine:** options chain view, order placement through Tradier sandbox, position tracking, expiration handling.
- **M3 — Decision Framework & Journal:** trade ticket form, JournalEntry persistence, post-close/expiration grading logic.
- **M4 — Learn Hub:** curriculum content (9 lessons), contextual triggers, progress tracking.
- **M5 — AI Tutor:** provider interface, Gemini Flash integration, contextual grounding, chat UI in Learn Hub/Journal/Symbol view.
- **M6 — News/Catalyst Panel:** Finnhub integration, on-demand Alpha Vantage sentiment pull, catalyst display on Symbol view.
- **Phase 2 milestones** (Greeks/IV, multi-leg, 0-2 DTE view, Progress & Analytics screen) once M0-M6 are solid and actually being used.
  - **Progress & Analytics** specifically: `PortfolioSnapshot` table + snapshot-on-trade-event hook, rolling grading-accuracy charts per Decision Framework dimension, confidence calibration view, performance breakdowns by catalyst/option-type/DTE, curriculum-correlation surfacing.
- **Phase 3 milestones** (scenario replay, theta-decay reminders, strategy comparison, local LLM, AI Trade Review) once Phase 2 is solid.
  - **AI Trade Review** specifically: server-side context assembly (JournalEntry + Trade + windowed OHLC/patterns + fresh Finnhub/Alpha Vantage pull), a review prompt template separate from the general tutor prompt, "Ask AI to review" action on closed Journal entries, persisted as a `ChatMessage` with `context_type="trade"`.

## Resources (curated)

- [Bullish Bears – Free Candlestick Patterns PDF](https://bullishbears.com/candlesticks-patterns/)
- [Chart Guys – Free Candlestick Patterns PDF](https://www.chartguys.com/articles/free-candlestick-patterns-pdf)
- [Strike.money – 60 Essential Candlestick Patterns](https://www.strike.money/technical-analysis/types-of-candlesticks-patterns)
- [Schwab – Basic Call and Put Options Strategies](https://www.schwab.com/learn/story/basic-call-and-put-options-strategies)
- [The Motley Fool – Call vs Put Options](https://www.fool.com/investing/how-to-invest/stocks/call-options-vs-put-options/)
- [Vanguard – What are call and put options?](https://investor.vanguard.com/investor-resources-education/understanding-investment-types/what-are-call-put-options)
- [Schwab – Zeroing on 0DTE Options](https://www.schwab.com/learn/story/zeroing-on-0dte-options-learn-basics)
- [SpotGamma – 0DTE Options Explained](https://support.spotgamma.com/hc/en-us/articles/15298463039251-0DTE-Options-Explained-What-They-Are-and-How-to-Trade-Them)
- [TradingBlock – Option Theta Explained](https://www.tradingblock.com/blog/option-theta-time-decay)
- [TradingView – Lightweight Charts (GitHub)](https://github.com/tradingview/lightweight-charts)
- [Tradier Brokerage API – Getting Started](https://docs.tradier.com/docs/getting-started)
- [Tradier API Endpoints](https://docs.tradier.com/docs/endpoints)
- [Alpha Vantage – News & Sentiment API](https://www.alphavantage.co/documentation/#news-sentiment)
- [Finnhub – API Rate Limits](https://finnhub.io/docs/api/rate-limit)
- [pandas-ta-classic (GitHub)](https://github.com/xgboosted/pandas-ta-classic)
- [Schwab – thinkorswim paperMoney](https://www.schwab.com/learn/story/thinkorswim-papermoney-stock-trading-simulator)

## Status

Planning complete. Ready to move into implementation starting at M0 whenever you are.
