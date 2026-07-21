from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import SessionLocal
from app.routers import health, journal, lessons, options, portfolio, positions, symbol, trades
from app.seed import seed_lessons

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_lessons(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Options & Stock Market Learning Simulator API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(portfolio.router)
app.include_router(symbol.router)
app.include_router(options.router)
app.include_router(trades.router)
app.include_router(positions.router)
app.include_router(journal.router)
app.include_router(lessons.router)
