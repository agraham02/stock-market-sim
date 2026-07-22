# Session Handoff — Stock Market Sim

Written 2026-07-22 so a Claude Code session on another machine can pick this up cold. Read this first, then `plan.md` (the living project plan — source of truth for scope/architecture/decisions). This file is about *session state and process*; `plan.md` is about *the product*.

## What this project is

A local, paper-money options/stock trading learning simulator. FastAPI backend, Next.js (App Router) frontend, Postgres via Docker. Core teaching mechanic is the "Decision Framework": every trade requires a stated catalyst/direction/magnitude/timeframe/confidence *before* submission, graded automatically after close against what actually happened.

## Repo / git state as of this handoff

- Everything is **committed and pushed** — `git status` is clean, local `main` matches `origin/main` (verified via `git fetch`). Just `git pull` on the other machine.
- Remote: `https://github.com/agraham02/stock-market-sim.git`
- Note: recent commit messages don't always precisely match their diffs (e.g. one commit titled about the AI Tutor also swept in unrelated later work like pattern-hover-highlight and recent-searches) — don't rely on commit messages alone to reconstruct history; `git log -p` if you need specifics.

## Build status: M0–M5 done, M6 not started

Milestones from `plan.md`'s "Build Milestones" section:
- **M0 Setup, M1 Data & Charts, M2 Paper Trading Engine, M3 Decision Framework & Journal, M4 Learn Hub, M5 AI Tutor** — all implemented and working.
- **M6 — News/Catalyst Panel** (Finnhub integration, on-demand Alpha Vantage sentiment, catalyst display on Symbol view) — **not started**. Needs Finnhub + Alpha Vantage API keys.
- **Tradier sandbox** — never got configured (user had trouble obtaining the sandbox key partway through an earlier session). The app currently runs entirely on the `yfinance` fallback for market data. `TRADIER_ACCESS_TOKEN`/`TRADIER_ACCOUNT_ID` in `backend/.env` are empty. If picking this up, either get a Tradier sandbox key (https://developer.tradier.com/user/sign_up) or keep deferring — yfinance has been sufficient so far.
- Phase 2 (Greeks/IV, multi-leg, 0-2 DTE view, Progress & Analytics) and Phase 3 (scenario replay, AI Trade Review, local LLM) are documented in `plan.md` but not started — intentionally deferred until M0-M6 feel solid.
- A **"Backlog — Unscheduled Ideas"** section was just added to `plan.md` (interactive onboarding walkthrough, Learn Hub quizzes/scenarios, re-evaluating the charting library for Phase 2 needs) — ideas the user raised but that didn't fit neatly into an existing phase.

## Environment setup on a fresh machine

Everything runs **natively** except Postgres (explicit user choice — native gives the fastest edit/reload loop; only Postgres is containerized to avoid host-install friction):

1. `docker compose up -d` (starts Postgres per `docker-compose.yml`)
2. Backend: `cd backend`, create/activate a venv, `pip install -r requirements.txt`, copy `backend/.env.example` → `backend/.env` and fill in keys (see below), `alembic upgrade head`, `uvicorn app.main:app --reload --port 8000`
3. Frontend: `cd frontend`, `npm install`, `npm run dev` (port 3000)
4. Seed data (lessons) auto-seeds idempotently on backend startup via `lifespan` in `app/main.py` — no manual step needed.

**API keys needed in `backend/.env`** (never paste raw key values into chat — add them directly to the file):
- `GEMINI_API_KEY` — already obtained and configured on the original machine; **will need to be re-added on a new machine** since `.env` is gitignored and doesn't travel with git. AI Tutor provider is set to `gemini`, model `gemini-flash-latest` (see gotcha below for why not `gemini-2.5-flash`).
- `ANTHROPIC_API_KEY` — alternate provider, implemented but not the active default.
- `TRADIER_ACCESS_TOKEN` / `TRADIER_ACCOUNT_ID` — not configured, optional (yfinance fallback covers current functionality).
- `FINNHUB_API_KEY` / `ALPHA_VANTAGE_API_KEY` — needed only when M6 starts.

## Non-obvious gotchas (would waste time rediscovering)

- **Git Bash / MSYS2 shell state doesn't persist between tool calls.** Always chain `source .venv/Scripts/activate && <command>` in one invocation — a bare `source` in a prior call has no effect on the next.
- **This Next.js (16.2.11) and shadcn setup are meaningfully newer than training-data knowledge.** shadcn here uses the newer `@base-ui/react`-based "base-nova" style, not classic Radix. Read `frontend/AGENTS.md` (says to check `node_modules/next/dist/docs/`) before assuming an API from memory. Same caution applies to `lightweight-charts` v5 (new `addSeries`/`createSeriesMarkers` API) and the Gemini SDK (`google-genai`, not the older `google-generativeai`).
- **`gemini-2.5-flash` 404s** ("no longer available to new users") — using `gemini-flash-latest` instead. Also, Gemini's newer flash models spend a mandatory chunk of `max_output_tokens` on hidden "thinking" even with `thinking_level="low"`; `tutor_max_output_tokens` is set to 1024 (not ~200-300) to avoid truncated replies. `thinking_budget=0` is rejected outright on this model.
- **SQLAlchemy `Numeric` columns default to returning `decimal.Decimal`**, which breaks arithmetic against plain `float`s. All `Numeric(...)` columns across the models use `asdecimal=False`.
- **Tailwind v4 flex-shrink bug** (bit us twice): a `flex flex-col` container with `max-h-[Nvh] overflow-y-auto` will *shrink/crush* children instead of scrolling once content exceeds max-height, because children default to `flex-shrink: 1`. Fix is `*:shrink-0` on the container, not something else.
- **Playwright selector ambiguity**: scope locators to `[data-slot="dialog-content"]` / `[data-slot="sheet-content"]` etc. before grabbing generic things like `button[type="submit"]` — the page has multiple matches otherwise (e.g. nav search "Go" button vs. a sheet's submit button).
- **Windows terminal / `python -m json.tool` mangles UTF-8 em-dashes** in seed lesson content to `â€”`-looking garbage — this is a display artifact only (verified via raw byte inspection), not real data corruption. Don't "fix" the seed data if you see this.
- **A stray "phantom" listening socket was observed on port 8000 during cleanup** in the previous session — `netstat`/`Get-NetTCPConnection` reported a PID that no process-enumeration tool (`Get-Process`, `Get-CimInstance`) could actually find, while `curl` kept getting real 200 responses from an actual uvicorn instance. Root cause wasn't nailed down (best guess: some Windows/WatchFiles reload-related socket handoff quirk); if you hit a "can't find the process but the port responds" situation, don't burn too much time on it — the port is genuinely alive and something is serving it, just look harder for the true PID via `Get-CimInstance Win32_Process -Filter "CommandLine LIKE '%uvicorn%'"` or similar. **Current instruction from the user: don't stop the dev servers.** Both are currently running (backend :8000, frontend :3000) — leave them up unless told otherwise.

## Verification workflow that's worked well this project

- Backend: `curl` against the running FastAPI server, not just type-checking.
- Frontend: a scratch Playwright script (chromium, no `chromium-cli` available in this environment, installed `playwright` npm package directly into the scratchpad dir) that navigates, interacts, screenshots, and checks `console` for errors. Always actually look at the screenshot — don't just check for absence of thrown errors.
- Reset test/seed data after verification passes (e.g. `TRUNCATE ... RESTART IDENTITY CASCADE` on tables you dirtied) so the repo/db stays in a clean, reproducible state.

## Most recent work (this session, already committed)

1. Adopted shadcn's `message-scroller` + `message` components for the AI Tutor chat panel (`frontend/src/components/tutor-button.tsx`), replacing a hand-rolled scroll-to-bottom `useEffect`. Verified it correctly yields to user-initiated scroll instead of fighting it.
2. Documented the Gemini free-tier finding and the model-substitution/thinking-token gotchas in `plan.md`.
3. Added **pattern hover-highlight**: hovering a detected candlestick pattern (`frontend/src/components/pattern-list.tsx`) highlights its marker on the chart (`frontend/src/components/candlestick-chart.tsx`) and re-centers the chart's visible range on it.
4. Added **locally-persisted recent searches** to the nav search bar (`frontend/src/components/nav.tsx`) — last 5 symbols in `localStorage`, shown as a dropdown on focus.
5. Added a **"Backlog — Unscheduled Ideas"** section to `plan.md` for: interactive onboarding walkthrough, Learn Hub quizzes/interactive scenarios, and re-evaluating the charting library once Phase 2 needs (Greeks overlays, payoff diagrams, 0-2 DTE view) are in scope.

## Suggested next step

No milestone was explicitly requested next. The natural next options, in rough order of what unblocks the most: (a) get a Tradier sandbox key and wire it in as the primary market-data source, (b) start M6 (News/Catalyst Panel) if Finnhub/Alpha Vantage keys are available, or (c) pick off one of the backlog ideas above. Don't assume which one — ask the user, since their last several requests were opportunistic ("here's a thought, do it or note it") rather than a fixed roadmap order.
