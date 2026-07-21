from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    database_url: str = "postgresql+psycopg://sim:sim@localhost:5432/stock_market_sim"

    # Portfolio defaults
    default_starting_balance: float = 100_000.0

    # Risk guardrail: soft-warn when a single trade exceeds this fraction of portfolio value
    risk_warning_threshold_pct: float = 0.08

    # Tradier sandbox
    tradier_api_base: str = "https://sandbox.tradier.com/v1"
    tradier_access_token: str = ""
    tradier_account_id: str = ""

    # News/catalyst providers
    finnhub_api_key: str = ""
    alpha_vantage_api_key: str = ""

    # AI tutor
    ai_tutor_provider: str = "gemini"  # gemini | anthropic | ollama
    gemini_api_key: str = ""
    anthropic_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"

    # CORS
    frontend_origin: str = "http://localhost:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
