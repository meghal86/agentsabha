# AgentSabha

AgentSabha is a Phase 1 MP co-pilot for three Lok Sabha constituencies. It ingests citizen issues from WhatsApp and the web, clusters them into constituency intelligence, drafts Rule 32-ready parliamentary questions, and prepares weekly MP briefs.

This repository preserves the approved visual prototype at the repo root and adds the production monorepo scaffold required by the March 2026 FRD and master build prompt.

## Repo layout

- `backend/`: FastAPI, Celery, SQLAlchemy, Alembic, agent/task/service code
- `frontend/`: Next.js 14 application shell and typed API client
- `art/`: reusable prototype art system assets
- Root `*.html`, `styles.css`, `script.js`: approved design reference screens 01-08

## Current implementation status

- Prototype screens 01-08 are preserved without style changes
- Backend production scaffold is in place
- Frontend production scaffold is in place
- Session handoff protocol files are in place
- Database migrations, live integrations, and end-to-end loop implementation are in progress

## Getting started

### Prototype preview

```bash
npm run prototype:start
```

Then open `http://127.0.0.1:4173/`.

### Frontend app

```bash
cd frontend
npm install
npm run dev
```

### Backend app

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Constraints carried into code

- Phase 1 only: 3 constituencies, no media engine, no 543-live deployment
- All parliamentary outputs remain drafts for MP review
- No Aadhaar number storage, only VID token handling
- Every agent action must be auditable
- Approved visual system remains the baseline for the product UI

