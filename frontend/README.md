# CareAxis Frontend

React + Vite frontend integrated with the FastAPI backend.

## Backend Endpoints Used

- `POST /auth/register`
- `POST /auth/login`
- `GET /patients`
- `POST /patients`
- `POST /visits/analyze`

## Local Setup

1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

2. Frontend
```bash
cd frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:8080` and calls backend at `http://127.0.0.1:8000` by default.

## Notes

- Backend now has CORS enabled for:
  - `http://localhost:8080`
  - `http://127.0.0.1:8080`
- To use a different API URL, update `VITE_API_BASE_URL` in `.env`.
