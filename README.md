# HireFlow

Recruiter Autopilot Agent built for the Qwen Cloud Global AI Hackathon, Track 4.

HireFlow automates the hiring pipeline from intake to matching to human-reviewed decisions. It parses job postings and candidate profiles, ranks candidates with visible reasoning, requires a human approval checkpoint before any candidate-facing action, drafts interview invites on approval, generates skill-gap feedback on rejection, and records every agent action in an audit log.

## Live Demo

- App: http://147.139.198.24
- API health: http://147.139.198.24/api/health
- API docs: http://147.139.198.24/docs
- Deployment: Alibaba Cloud ECS, ApsaraDB RDS PostgreSQL, Alibaba Cloud OSS, and Qwen via DashScope.

## Core Principles

- Human approval is mandatory before approve, reject, or schedule outcomes.
- No real emails or messages are sent in this build; the system drafts and logs only.
- Matching and consistency checks use skills, experience, education, and stated requirements only.
- Protected demographic attributes must never be used.
- Secrets are loaded from environment variables or local `.env`, never hardcoded.
- No dedicated vector database is used; local scoring and Postgres-compatible storage are enough for this MVP.

## Local Development

Backend:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

API docs are available at:

```text
http://127.0.0.1:8000/docs
```

## Environment

Copy `.env.example` to `.env` for local development.

```env
DASHSCOPE_ENABLED=false
DASHSCOPE_API_KEY=
DATABASE_URL=sqlite:///./hireflow_dev.db
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
OSS_ENDPOINT=
OSS_BUCKET=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
```

Keep `.env` private. It is ignored by git.

For the frontend, copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For the deployed Alibaba ECS build, the frontend is served by Nginx and uses:

```env
VITE_API_BASE_URL=/api
```

## Main Endpoints

- `POST /jobs`
- `POST /candidates`
- `GET /jobs/{job_id}/shortlist`
- `POST /decisions/{candidate_id}/approve`
- `POST /decisions/{candidate_id}/reject`
- `GET /decisions/log`

## Verification

Run the contract smoke test against a running backend:

```bash
python scripts/smoke_contract.py http://127.0.0.1:8000
```

Reset the local demo database:

```bash
python scripts/reset_demo_db.py
```

## Deployment

The current hackathon deployment is live on Alibaba ECS at `http://147.139.198.24`.

See `DEPLOYMENT.md` for Alibaba Cloud, RDS/Postgres, CORS, Nginx, and DashScope deployment notes.
