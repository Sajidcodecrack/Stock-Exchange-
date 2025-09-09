from typing import Optional
from sqlmodel import SQLModel, Field, Index

class Trade(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: str = Field(index=True)
    trade_code: str = Field(index=True)
    open: float
    high: float
    low: float
    close: float
    volume: int

__all__ = ["Trade"]
