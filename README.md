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
```
stock-exchange-app/
│
├── backend/
│   ├── app/
│   │   ├── main_sql.py       # FastAPI app with SQLModel (CRUD, charts API)
│   │   ├── main.py           # Optional FastAPI app (JSON-only variant)
│   │   ├── models.py         # SQLModel definitions (e.g., Trade)
│   │   ├── db.py             # Database engine + session maker
│   │   └── etl_load.py       # CSV loader + /admin/load-csv endpoint
│   │
│   ├── data/
│   │   └── stocks.csv        # Dataset (CSV)
│   │
│   └── requirements.txt      # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # React app (charts + CRUD + pagination)
│   │   └── api.js            # API client (CRUD functions)
│   │
│   └── vercel.json           # SPA rewrites config
│
└── README.md
```

---

## Run locally

### Backend (SQLite)

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
. .venv/Scripts/activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# load CSV into local SQLite
python -m app.etl_load

# run API
uvicorn app.main_sql:app --reload --port 8000
```
## Frontend 
```
cd frontend
npm i
```
``` Run the project
cd frontend
npm run dev
```
## Cloud deploy
**Backend on Render (free)**

**Build: pip install -r requirements.txt**

**Start: uvicorn app.main_sql:app --host 0.0.0.0 --port $PORT**

**Env vars:**

**PYTHON_VERSION=3.11.9**

**DATABASE_URL=postgresql+psycopg://USER:PWD@HOST:5432/DB?sslmode=require**

ADMIN_TOKEN=<long-random-string> ← used to seed CSV

CORS in main_sql.py:
``` create .env in frontend/:
 VITE_API_URL=http://127.0.0.1:8000
```
npm run dev
```
## Open: http://localhost:5173
```
## Cloud deploy
**Backend on Render (free)**

```Build: pip install -r requirements.txt```

```Start: uvicorn app.main_sql:app --host 0.0.0.0 --port $PORT```

Env vars:

**PYTHON_VERSION=3.11.9**

```DATABASE_URL=postgresql+psycopg://USER:PWD@HOST:5432/DB?sslmode=require```

```ADMIN_TOKEN=<long-random-string> ← used to seed CSV```
## Frontend on Vercel

```yaml
root_directory: frontend
build_command: "npm ci && npm run build"
output_directory: dist
env_vars:
  VITE_API_URL: "https://stock-exchange-1-kwl1.onrender.com"
vercel_json:
  rewrites:
    - source: "/(.*)"
      destination: "/"
```
# Performance notes
**- Indexed (trade_code, date) for faster filter+sort**

**- Server-side pagination with limit ≤ 1000**

**- Gzip + ORJSON responses**
# What I learned 
**- FastAPI + SQLModel setup with SQLAlchemy 2 patterns**

**- Handling CSV with mixed numeric formats (commas)**

**- CORS, env-driven config, and cloud DB drivers (psycopg v3)**
**- Free-tier Render constraints → admin seeding endpoint**
**- Vite env handling and SPA rewrites on Vercel**
# Challenges 
**- Postgres driver mismatch (psycopg2 vs psycopg)**

**- CORS origins across local, preview, and prod**

**- Loading data on Render without paid shell**
# How to test
**- Select a trade_code**
                                                    
**- View line chart (close) and bar chart (volume)**

**- Edit close/volume inline → save → refresh → persists**

**- Add new row → appears**

**- Delete row → removed**

**- Use pagination controls**




