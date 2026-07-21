# Options & Stock Market Learning Simulator

See [plan.md](plan.md) for the full product plan. This is the M0 scaffold: Postgres via Docker, a FastAPI backend, and a Next.js frontend.

## Prerequisites

- Docker Desktop
- Python 3.12+
- Node.js 22+

## First-time setup

```bash
# 1. Start Postgres
docker compose up -d postgres

# 2. Backend
cd backend
python -m venv .venv
.venv/Scripts/activate        # macOS/Linux: source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env          # fill in Tradier/Finnhub/AI keys as you get them
alembic upgrade head

# 3. Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
```

## Running

```bash
# Terminal 1
cd backend && .venv/Scripts/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

Frontend: http://localhost:3000 — Backend docs: http://localhost:8000/docs

## Database migrations

```bash
cd backend
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## API keys needed as features come online

- **Tradier sandbox** — https://developer.tradier.com/user/sign_up (paper trading + options chains)
- **Finnhub** — https://finnhub.io/register (news/catalysts)
- **Alpha Vantage** — https://www.alphavantage.co/support/#api-key (sentiment, rate-limited)
- **Gemini** — https://aistudio.google.com/apikey (AI tutor, default provider)

Drop them into `backend/.env` (see `backend/.env.example`).
