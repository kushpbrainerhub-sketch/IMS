# IMS — Inventory Management System (Stationery Shop)

React frontend, FastAPI backend, PostgreSQL database.

## Prerequisites

- Python 3.13+
- Node.js 22+
- PostgreSQL (local instance, database `ims` already created)

## Backend

```
cd backend
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

Copy `.env.example` to `.env` and fill in `DATABASE_URL` / `SECRET_KEY` if setting up on a new machine.

## Frontend

```
cd frontend
npm install
npm run dev
```

App: http://localhost:5173 (proxies `/api` to the backend on port 8000)

## Database migrations (Alembic)

```
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```
