from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import health, options, portfolio, positions, symbol, trades

settings = get_settings()

app = FastAPI(title="Options & Stock Market Learning Simulator API")

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
