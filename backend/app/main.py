from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, TypedDict
import json

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from pydantic import BaseModel
from starlette.middleware.gzip import GZipMiddleware

# ---------- paths ----------
BASE_DIR = Path(__file__).resolve().parents[1]            # .../backend
DATA_DIR = BASE_DIR / "data"
# prefer stocks.json; fall back to stock_market_data.json if present
CANDIDATES = ["stocks.json", "stock_market_data.json"]
DATA_FILE = next((DATA_DIR / n for n in CANDIDATES if (DATA_DIR / n).exists()), DATA_DIR / "stocks.json")

class Row(TypedDict, total=False):
    date: str
    trade_code: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class Paginated(BaseModel):
    total: int
    items: List[Row]

app = FastAPI(title="jsonModel API", default_response_class=ORJSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)

def _to_float(v) -> float:
    if v is None:
        return 0.0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).replace(",", "").strip()
    if s == "" or s.lower() in {"nan", "null"}:
        return 0.0
    return float(s)

def _to_int(v) -> int:
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return int(v)
    s = str(v).replace(",", "").strip()
    if s == "" or s.lower() in {"nan", "null"}:
        return 0
    return int(float(s))

@lru_cache(maxsize=1)
def load_data() -> List[Row]:
    with DATA_FILE.open("r", encoding="utf-8") as f:
        raw: List[Dict[str, Any]] = json.load(f)

    out: List[Row] = []
    for d in raw:
        out.append(
            Row(
                date=str(d.get("date") or d.get("Date") or "").strip(),
                trade_code=str(d.get("trade_code") or d.get("Trade Code") or d.get("tradeCode") or "").strip(),
                open=_to_float(d.get("open") or d.get("Open")),
                high=_to_float(d.get("high") or d.get("High")),
                low=_to_float(d.get("low") or d.get("Low")),
                close=_to_float(d.get("close") or d.get("Close")),
                volume=_to_int(d.get("volume") or d.get("Volume")),
            )
        )
    return out

# ---------- routes ----------
@app.get("/")
def root() -> Dict[str, str]:
    return {"msg": "jsonModel API. See /docs", "data_file": str(DATA_FILE)}

@app.get("/healthz")
def healthz() -> Dict[str, str]:
    return {"status": "ok"}

@app.get("/api/trade-codes")
def trade_codes() -> List[str]:
    data = load_data()
    return sorted({r["trade_code"] for r in data if r.get("trade_code")})

@app.get("/api/data", response_model=Paginated)
def list_data(
    trade_code: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: str = Query("date"),              # date | close | volume
    order: str = Query("asc"),              # asc | desc
) -> Paginated:
    rows = load_data()

    if trade_code:
        tc = trade_code.upper()
        rows = [r for r in rows if r.get("trade_code", "").upper() == tc]
    if date_from:
        rows = [r for r in rows if r.get("date") and r["date"] >= date_from]
    if date_to:
        rows = [r for r in rows if r.get("date") and r["date"] <= date_to]

    key_map = {
        "date": lambda r: r.get("date") or "",
        "close": lambda r: r.get("close") or 0.0,
        "volume": lambda r: r.get("volume") or 0,
    }
    key = key_map.get(sort, key_map["date"])
    rows.sort(key=key, reverse=(order == "desc"))

    total = len(rows)
    items = rows[offset : offset + limit]
    return Paginated(total=total, items=items)
