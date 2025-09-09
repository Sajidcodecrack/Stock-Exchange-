# backend/app/main_sql.py
from typing import List, Optional, Dict

from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from starlette.middleware.gzip import GZipMiddleware

from sqlmodel import SQLModel, Session, select
from .db import get_session, init_db
from .models import Trade

app = FastAPI(title="sqlModel API", default_response_class=ORJSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/healthz")
def healthz() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/trade-codes", response_model=List[str])
def trade_codes(session: Session = Depends(get_session)):
    # In SQLAlchemy 2.x, Session.exec(select(col)) may already return ScalarResult.
    # So just .all() here (not .scalars().all()).
    rows = session.exec(select(Trade.trade_code).distinct()).all()
    return sorted([r for r in rows if r])


@app.get("/api/trades")
def list_trades(
    trade_code: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    sort: str = Query("date"),  # date|close|volume
    order: str = Query("asc"),  # asc|desc
    session: Session = Depends(get_session),
):
    # base query
    q = select(Trade)
    cq = select(Trade.id)  # for counting via len()

    if trade_code:
        q = q.where(Trade.trade_code == trade_code)
        cq = cq.where(Trade.trade_code == trade_code)
    if date_from:
        q = q.where(Trade.date >= date_from)
        cq = cq.where(Trade.date >= date_from)
    if date_to:
        q = q.where(Trade.date <= date_to)
        cq = cq.where(Trade.date <= date_to)

    # total (simple and compatible)
    total_len = len(session.exec(cq).all())

    # sorting
    colmap = {"date": Trade.date, "close": Trade.close, "volume": Trade.volume}
    col = colmap.get(sort, Trade.date)
    q = q.order_by(col.desc() if order == "desc" else col.asc())

    items = session.exec(q.offset(offset).limit(limit)).all()
    return {"total": total_len, "items": items}


@app.post("/api/trades", response_model=Trade, status_code=201)
def create_trade(payload: Trade, session: Session = Depends(get_session)):
    payload.id = None
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@app.patch("/api/trades/{trade_id}", response_model=Trade)
def update_trade(trade_id: int, patch: dict, session: Session = Depends(get_session)):
    obj = session.get(Trade, trade_id)
    if not obj:
        raise HTTPException(404, "Not found")
    for k, v in patch.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    session.add(obj)
    session.commit()
    session.refresh(obj)
    return obj


@app.delete("/api/trades/{trade_id}", status_code=204)
def delete_trade(trade_id: int, session: Session = Depends(get_session)):
    obj = session.get(Trade, trade_id)
    if not obj:
        raise HTTPException(404, "Not found")
    session.delete(obj)
    session.commit()
    return None
