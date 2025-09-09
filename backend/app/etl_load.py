# backend/app/etl_load.py
import csv
from pathlib import Path
from typing import Iterable

from sqlmodel import Session, delete
from .db import engine, init_db
from .models import Trade

BASE_DIR = Path(__file__).resolve().parents[1]  # .../backend
CSV_FILE = BASE_DIR / "data" / "stock_market_data.csv"     # put your CSV here


def to_float(v) -> float:
    if v is None:
        return 0.0
    s = str(v).replace(",", "").strip()
    if s in {"", "nan", "null"}:
        return 0.0
    return float(s)


def to_int(v) -> int:
    if v is None:
        return 0
    s = str(v).replace(",", "").strip()
    if s in {"", "nan", "null"}:
        return 0
    return int(float(s))


def iter_rows(csv_path: Path) -> Iterable[Trade]:
    with csv_path.open(newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for d in r:
            yield Trade(
                date=str(d.get("date") or d.get("Date") or "").strip(),
                trade_code=str(
                    d.get("trade_code") or d.get("Trade Code") or d.get("tradeCode") or ""
                ).strip(),
                open=to_float(d.get("open") or d.get("Open")),
                high=to_float(d.get("high") or d.get("High")),
                low=to_float(d.get("low") or d.get("Low")),
                close=to_float(d.get("close") or d.get("Close")),
                volume=to_int(d.get("volume") or d.get("Volume")),
            )


def main():
    if not CSV_FILE.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_FILE}")

    init_db()
    with Session(engine) as s:
        # clear table (SQLAlchemy 2.0 style)
        s.exec(delete(Trade))
        s.commit()

        # bulk insert in chunks
        batch = []
        for t in iter_rows(CSV_FILE):
            batch.append(t)
            if len(batch) >= 2000:
                s.add_all(batch)
                s.commit()
                batch.clear()
        if batch:
            s.add_all(batch)
            s.commit()

    print("Loaded CSV into DB")


if __name__ == "__main__":
    main()
