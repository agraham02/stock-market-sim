from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PortfolioRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cash_balance: float
    starting_balance: float
    created_at: datetime
