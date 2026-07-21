from pydantic import BaseModel


class OptionContractRead(BaseModel):
    strike: float
    bid: float
    ask: float
    last: float
    volume: int
    open_interest: int
    implied_volatility: float | None
    in_the_money: bool


class OptionChainRead(BaseModel):
    symbol: str
    expiration: str
    calls: list[OptionContractRead]
    puts: list[OptionContractRead]
