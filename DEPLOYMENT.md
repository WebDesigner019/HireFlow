# HireFlow Deployment

## Live Deployment

- App: http://147.139.198.24
- API health: http://147.139.198.24/api/health
- API docs: http://147.139.198.24/docs
- Host: Alibaba Cloud ECS in Indonesia (Jakarta)
- Database: Alibaba Cloud ApsaraDB RDS PostgreSQL
- File storage: Alibaba Cloud OSS bucket `hireflow-resume`
- Model provider: Qwen through Alibaba Cloud DashScope

## Required Production Environment

Set these on Alibaba Cloud ECS for the backend. Do not bake them into the image.

```env
DASHSCOPE_ENABLED=true
DASHSCOPE_API_KEY=
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
FRONTEND_ORIGINS=http://147.139.198.24
OSS_ENDPOINT=
OSS_BUCKET=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
```

Keep all real values in `.env` on the server only. Never commit `.env` or paste secrets into frontend code.

For the ECS/Nginx deployment, set this in `frontend/.env` before building:

```env
VITE_API_BASE_URL=/api
```

## Local Verification

```bash
python scripts/smoke_contract.py http://127.0.0.1:8000
```

## Docker Run

```bash
docker build -t hireflow-backend .
docker run --env-file .env -p 8000:8000 hireflow-backend
```

## ECS Deployment Shape

Nginx serves the React build from `/opt/hireflow/frontend/dist` and proxies `/api/*` to the FastAPI service running on `127.0.0.1:8000`.

FastAPI runs as a systemd service:

```text
hireflow-api.service
```

## Deployment Checklist

1. Create Alibaba Cloud RDS PostgreSQL and set `DATABASE_URL`.
2. Configure `FRONTEND_ORIGINS` with the ECS public URL.
3. Configure DashScope key and set `DASHSCOPE_ENABLED=true`.
4. Configure OSS variables for resume file storage.
5. Install backend dependencies and run FastAPI as `hireflow-api.service`.
6. Build the frontend with `VITE_API_BASE_URL=/api`.
7. Configure Nginx for React static files and `/api` proxying.
8. Run `scripts/smoke_contract.py` on ECS.
9. Verify `http://147.139.198.24`, `/api/health`, and `/docs`.
10. Record hackathon proof: deployed workflow, Qwen-backed parsing, human approval, and audit log.
