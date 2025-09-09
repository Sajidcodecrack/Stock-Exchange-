# Stock Exchange — React + FastAPI (jsonModel & sqlModel)

## Live demo
- **Frontend (Vercel):** [https://stock-exchange-yp2k.vercel.app](https://stock-exchange-yp2k.vercel.app)  
- **Backend (Render):** [https://stock-exchange-1-kwl1.onrender.com](https://stock-exchange-1-kwl1.onrender.com)

---

## Overview

This project demonstrates a **full-stack stock dashboard** in two phases:

- **jsonModel (phase-1):** Read-only charts served from static JSON.  
- **sqlModel (phase-2):** SQL-backed CRUD with charts, pagination, and filtering.  

### Features
- **CRUD:** Create, edit, delete stock rows.  
- **Charts:** Line (closing price over time) + Bar (volume).  
- **Filter:** By `trade_code` with pagination and sorting.  
- **Deployments:** Free-tier friendly (Render + Vercel).  

> **Note:** Render free tier does not allow shell seeding.  
> A protected admin endpoint `/admin/load-csv` bulk-loads the CSV into Postgres.

---

## Tech stack

- **Frontend:** React + Vite, Recharts, Axios  
- **Backend:** FastAPI, SQLModel/SQLAlchemy 2, Uvicorn, ORJSON  
- **Database:** SQLite (local dev) and PostgreSQL (Render)  
- **Hosting:** Render (API) + Vercel (SPA)

---

## Project structure
backend/
  app/
    main_sql.py       # FastAPI (sqlModel)
    main.py           # optional jsonModel variant
    models.py         # SQLModel Trade
    db.py             # engine + session
    etl_load.py       # CSV loader + /admin callable
  data/stocks.csv     # dataset (CSV)
  requirements.txt
frontend/
  src/App.jsx         # UI with charts + CRUD + pagination
  src/api.js          # API client (CRUD)
  vercel.json         # SPA rewrites


