# Session Handoff — Stock Market Sim

Written 2026-07-22 (updated later same day, second session on this machine) so a Claude Code session — on this machine or another — can pick this up cold. Read this first, then `plan.md` (the living project plan — source of truth for scope/architecture/decisions). This file is about *session state and process*; `plan.md` is about *the product*.

## What this project is

A local, paper-money options/stock trading learning simulator. FastAPI backend, Next.js (App Router) frontend, Postgres via Docker. Core teaching mechanic is the "Decision Framework": every trade requires a stated catalyst/direction/magnitude/timeframe/confidence *before* submission, graded automatically after close against what actually happened.

## Repo / git state as of this handoff

- `main` is **1 commit ahead of `origin/main`** (M6 News/Catalyst work — see Build status below) — needs `git push` when convenient.
- **Uncommitted working-tree changes** on top of that: the onboarding tour, interactive lesson walkthroughs, and Learn Hub quizzes/scenarios (see "Most recent work" below) — a full feature, not yet committed. Nothing was committed automatically this session (only commit when the user explicitly asks).
- Remote: `https://github.com/agraham02/stock-market-sim.git`
- Note: commit messages don't always precisely match their diffs — `git log -p` if you need specifics.

## Build status: M0–M6 done, plus onboarding/quiz/walkthrough backlog items done

Milestones from `plan.md`'s "Build Milestones" section:
- **M0 Setup, M1 Data & Charts, M2 Paper Trading Engine, M3 Decision Framework & Journal, M4 Learn Hub, M5 AI Tutor, M6 News/Catalyst Panel** — all implemented and working. M6 (Finnhub headlines/earnings + on-demand Alpha Vantage sentiment) was built and verified with live data this session/last.
- **Backlog items now done** (were listed as unscheduled ideas in `plan.md`, built this session): interactive onboarding walkthrough, Learn Hub quizzes, Learn Hub branching "what would you do" scenarios, and interactive per-lesson screen walkthroughs. Details in "Most recent work" below.
- **Tradier sandbox** — still never configured (user had trouble obtaining the sandbox key). App runs entirely on the `yfinance` fallback for market data. `TRADIER_ACCESS_TOKEN`/`TRADIER_ACCOUNT_ID` in `backend/.env` are empty.
- Phase 2 (Greeks/IV, multi-leg, 0-2 DTE view, Progress & Analytics) and Phase 3 (scenario replay, AI Trade Review, local LLM) are documented in `plan.md` but not started — intentionally deferred until M0-M6 feel solid.
- Remaining backlog idea: re-evaluating the charting library once Phase 2 needs (Greeks overlays, payoff diagrams, 0-2 DTE view) are in scope.

## Environment setup on a fresh machine

Everything runs **natively** except Postgres (explicit user choice — native gives the fastest edit/reload loop; only Postgres is containerized to avoid host-install friction):

1. `docker compose up -d` (starts Postgres per `docker-compose.yml`; Docker Desktop must be running first — `Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"` if not)
2. Backend: `cd backend`, `python -m venv .venv`, `pip install -e ".[dev]"` (no `requirements.txt` — deps are in `pyproject.toml`), copy `backend/.env.example` → `backend/.env` and fill in keys (see below), `alembic upgrade head`, `uvicorn app.main:app --reload --port 8000`
3. Frontend: `cd frontend`, `npm install`, `npm run dev` (port 3000)
4. Seed data (lessons, including quizzes/scenarios/walkthroughs) auto-seeds and auto-backfills idempotently on backend startup via `lifespan` in `app/main.py` — no manual step needed.

**⚠️ On this machine right now, the backend is running on port 8010, not 8000** (with `frontend/.env.local` setting `NEXT_PUBLIC_API_BASE_URL=http://localhost:8010`) — see the port 8000 gotcha below. On a genuinely fresh machine, try port 8000 first; only fall back to a different port + `.env.local` override if you hit the same phantom-socket symptom.

**API keys needed in `backend/.env`** (never paste raw key values into chat — add them directly to the file):
- `GEMINI_API_KEY` — configured on this machine already. AI Tutor provider is set to `gemini`, model `gemini-flash-latest` (see gotcha below for why not `gemini-2.5-flash`).
- `ANTHROPIC_API_KEY` — alternate provider, implemented but not the active default.
- `TRADIER_ACCESS_TOKEN` / `TRADIER_ACCOUNT_ID` — not configured, optional (yfinance fallback covers current functionality).
- `FINNHUB_API_KEY` / `ALPHA_VANTAGE_API_KEY` — **configured on this machine**, M6 is live and verified with real data.

## Non-obvious gotchas (would waste time rediscovering)

- **Git Bash / MSYS2 shell state doesn't persist between tool calls.** Always chain `source .venv/Scripts/activate && <command>` in one invocation — a bare `source` in a prior call has no effect on the next.
- **This Next.js (16.2.11) and shadcn setup are meaningfully newer than training-data knowledge.** shadcn here uses the newer `@base-ui/react`-based "base-nova" style, not classic Radix. Read `frontend/AGENTS.md` (says to check `node_modules/next/dist/docs/`) before assuming an API from memory. Same caution applies to `lightweight-charts` v5 (new `addSeries`/`createSeriesMarkers` API) and the Gemini SDK (`google-genai`, not the older `google-generativeai`).
- **`gemini-2.5-flash` 404s** ("no longer available to new users") — using `gemini-flash-latest` instead. Also, Gemini's newer flash models spend a mandatory chunk of `max_output_tokens` on hidden "thinking" even with `thinking_level="low"`; `tutor_max_output_tokens` is set to 1024 (not ~200-300) to avoid truncated replies. `thinking_budget=0` is rejected outright on this model.
- **SQLAlchemy `Numeric` columns default to returning `decimal.Decimal`**, which breaks arithmetic against plain `float`s. All `Numeric(...)` columns across the models use `asdecimal=False`.
- **Tailwind v4 flex-shrink bug** (bit us twice): a `flex flex-col` container with `max-h-[Nvh] overflow-y-auto` will *shrink/crush* children instead of scrolling once content exceeds max-height, because children default to `flex-shrink: 1`. Fix is `*:shrink-0` on the container, not something else.
- **Playwright selector ambiguity**: scope locators to `[data-slot="dialog-content"]` / `[data-slot="sheet-content"]` etc. before grabbing generic things like `button[type="submit"]` — the page has multiple matches otherwise (e.g. nav search "Go" button vs. a sheet's submit button).
- **Windows terminal / `python -m json.tool` mangles UTF-8 em-dashes** in seed lesson content to `â€”`-looking garbage — this is a display artifact only (verified via raw byte inspection), not real data corruption. Don't "fix" the seed data if you see this.
- **Port 8000 gets into a genuinely broken "phantom socket" state on this machine — confirmed reproducible, not a one-off.** Symptom: `netstat -ano | Select-String ":8000"` shows 2+ PIDs `LISTENING` on `127.0.0.1:8000` simultaneously; the legitimate freshly-started uvicorn process is one of them, but requests consistently route to a stale/phantom one serving old code. Both `Get-CimInstance Win32_Process` **and** `taskkill /F /PID <pid>` report the phantom PIDs don't exist — there is no known way to kill them from a non-elevated shell. Root cause not identified (Docker Desktop's network virtualization is a plausible culprit but unconfirmed). **Workaround that worked**: stop chasing it, run the backend on a different port instead (`uvicorn app.main:app --reload --port 8010`) and point the frontend at it via `frontend/.env.local` (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8010`, gitignored) — then restart the frontend dev server so it picks up the env var. A full machine reboot would likely clear it too, but don't do that unilaterally. **Separately**, `uvicorn --reload`'s file-watcher itself sometimes hangs mid-reload after a source edit (log stops at "Reloading..." and never reaches "Application startup complete") — if that happens, don't wait it out, kill the task and start a fresh `uvicorn` invocation.
- **Before killing processes by a `CommandLine LIKE` filter, double-check the filter doesn't also match your own shell wrapper.** A `Stop-Process` pass filtered on `CommandLine LIKE '%uvicorn%'` matched not just stray backend processes but the *current* PowerShell tool-call process and the Bash-tool wrapper around the legitimate running server (their command lines embed the literal `uvicorn ...` string), self-terminating mid-script. Scope kill filters as tightly as possible (exact exe path, not a loose substring).
- **driver.js (tour/spotlight library) + this app's Tailwind theme**: don't theme `.driver-popover` with `all: unset` — driver.js relies on `pointer-events: auto` there (everything else under `.driver-active` gets `pointer-events: none`), and `all: unset` silently strips it, making the Next/Previous buttons unclickable with no console error. Only override the specific visual CSS properties.
- **Next.js App Router resets scroll to top after `router.push()`, racing with any manual `scrollIntoView()` call made right after navigating.** Hit this driving a cross-page product tour (driver.js): the popover positioned itself relative to a pre-scroll layout because Next's own scroll-reset fired *after* the manual scroll. Fix: re-assert the scroll after a short (~120ms) settle delay following any step that just navigated, instead of scrolling once immediately.

## Verification workflow that's worked well this project

- Backend: `curl` against the running FastAPI server (use `127.0.0.1`, not `localhost`, to sidestep IPv6-resolution-first weirdness in this shell), not just type-checking.
- Frontend: a scratch Playwright script (chromium, no `chromium-cli` available in this environment, installed `playwright` npm package directly into the scratchpad dir) that navigates, interacts, screenshots, and checks `console` for errors. Always actually look at the screenshot — don't just check for absence of thrown errors. Watch for Playwright locator strict-mode false negatives when a phrase appears twice on the page (e.g. once in prose, once in a component) — a `.catch(() => false)` around an ambiguous locator silently reports "not visible" even when it is; cross-check against the screenshot before treating that as a real bug.
- Reset test/seed data after verification passes (e.g. `UPDATE lessons SET completed_at = NULL WHERE ...` after clicking "Mark Complete" during a test) so the repo/db stays in a clean, reproducible state. Cache-table rows (news/sentiment) don't need resetting — that's real cached data, not test pollution.

## Most recent work (this session — uncommitted, see git state above)

Built three related features end-to-end (backend + frontend + Playwright-verified), sharing one underlying mechanism:

1. **Shared tour/spotlight engine** (`frontend/src/lib/tours/types.ts`, `frontend/src/store/tour-store.ts`, `frontend/src/components/tour/tour-runner.tsx`) — built on `driver.js` (new dependency, zero peer-deps), themed to match the app's shadcn/oklch tokens (`frontend/src/styles/driver-theme.css`). Drives cross-page tours: navigates via `router.push`, resolves the target element, scrolls it into view (with the Next.js scroll-race fix above), then hands it to driver.js. A `data-tour="<id>"` attribute convention was added across Dashboard/Symbol/Positions/Journal/Learn Hub.
2. **Onboarding tour** — a ~10-step tour across all 5 main screens. Opt-in via a `sonner` toast on first Dashboard visit (`frontend/src/components/tour/onboarding-prompt.tsx`, localStorage-gated so it only offers once), replayable anytime from a new help-icon dropdown menu in the nav.
3. **Interactive lesson walkthroughs** — `Lesson.walkthrough_json` (nullable JSON column) lets a lesson launch the same tour engine, navigating to and highlighting a real screen. Authored for Lessons 2 (Candlesticks → chart/patterns), 3 (Options → options chain), 7 (0-2 DTE → Positions DTE column), 9 (Catalysts → catalyst panel) — the 4 lessons with a distinct existing UI surface to point at. Shown as a "Walk me through it" button in `frontend/src/app/learn/page.tsx`.
4. **Learn Hub quizzes & branching scenarios** — `Lesson.quiz_json` (2-3 MC questions per lesson, all 9 lessons) and `Lesson.scenario_json` (branching "what would you do" vignette, Lessons 5/7/8/9 only) — both nullable JSON columns. Deliberately **ungated/stateless**: pick an answer, see right/wrong + explanation immediately, nothing persisted, doesn't block "Mark Complete" — matches the app's existing non-punitive tone. New components `frontend/src/components/lesson-quiz.tsx` and `lesson-scenario.tsx`.
5. **`seed_lessons()` was extended with a backfill pass** (`OPTIONAL_CONTENT_KEYS` in `backend/app/seed.py`) since it previously only inserted missing `order` values and never updated existing rows — without this, newly-authored walkthrough/quiz/scenario content would never reach the lessons already sitting in the DB. Now runs idempotently on every backend startup, filling only currently-`NULL` optional columns.

Also from earlier this session (M6, likely already committed per git state above): Finnhub news/earnings + on-demand Alpha Vantage sentiment, `CatalystPanel` component on the Symbol view, `NewsCache`/`SentimentCache` tables.

## Suggested next step

Nothing explicitly queued. Natural options, not in a fixed order: (a) commit this session's uncommitted work (ask first, per standing instruction to only commit when asked) and `git push` the M6 commit that's already ahead of origin, (b) get a Tradier sandbox key and wire it in as the primary market-data source, (c) the remaining backlog item — re-evaluate the charting library once Phase 2 needs are in scope, or (d) start Phase 2 itself (Greeks/IV, multi-leg, 0-2 DTE view, Progress & Analytics). Ask the user rather than assuming.
