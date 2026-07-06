# HireFlow Backend Deployment

## Required Production Environment

Set these on Alibaba Cloud ECS or Function Compute. Do not bake them into the image.

```env
DASHSCOPE_ENABLED=false
DASHSCOPE_API_KEY=
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
FRONTEND_ORIGINS=https://your-frontend-domain.example
OSS_ENDPOINT=
OSS_BUCKET=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
```

Use `DASHSCOPE_ENABLED=true` only after the DashScope account quota/payment setting is fixed.

## Local Verification

```bash
python scripts/smoke_contract.py http://127.0.0.1:8000
```

## Docker Run

```bash
docker build -t hireflow-backend .
docker run --env-file .env -p 8000:8000 hireflow-backend
```

## Deployment Checklist

1. Create Alibaba Cloud RDS PostgreSQL and set `DATABASE_URL`.
2. Configure frontend deployment URL in `FRONTEND_ORIGINS`.
3. Configure DashScope key and enable `DASHSCOPE_ENABLED=true` only when quota works.
4. Configure OSS variables if real resume file storage is needed.
5. Deploy container to ECS or Function Compute.
6. Run `scripts/smoke_contract.py` against the public backend URL.
7. Record hackathon proof: live request to deployed backend plus code showing DashScope call.
