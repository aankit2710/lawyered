# Deployment Guide

## Prerequisites

- Docker 24+ and Docker Compose v2
- Domain + TLS termination (reverse proxy: nginx, Caddy, or cloud load balancer)
- PostgreSQL 16 (included in compose) or managed Postgres
- OpenAI API key with billing enabled

## Quick production deploy

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit: JWT_SECRET, DB_PASSWORD, OPENAI_API_KEY, CORS_ORIGINS, NEXT_PUBLIC_API_URL

# 2. Build and start (migrations run automatically)
npm run docker:prod

# 3. Optional: seed demo account on first run
npm run docker:prod:seed
```

Services:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Health | http://localhost:3001/api/health |
| Readiness | http://localhost:3001/api/ready |
| Metrics (auth required) | http://localhost:3001/api/metrics |

## Environment variables (production)

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Strong random secret (32+ chars) |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `TYPEORM_SYNCHRONIZE` | Yes | Must be `false` in production |
| `RUN_MIGRATIONS` | Yes | Set `true` to apply migrations on start |
| `CORS_ORIGINS` | Yes | Comma-separated allowed frontend URLs |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL used by browser |
| `TRUST_PROXY` | Behind LB | Set `true` when behind reverse proxy |
| `DB_POOL_MAX` | Optional | Connection pool size (default 20) |
| `RUN_SEED` | Optional | `true` to run demo seed on container start |

## Database migrations

Migrations run automatically when `RUN_MIGRATIONS=true` (set in `docker-compose.prod.yml`).

Manual run (local):

```bash
cd apps/backend
RUN_MIGRATIONS=true npm run db:migrate
```

Initial migration bootstraps schema from entity metadata when tables do not exist.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Backend: install, build, phase tests (3, 5, 6, 8)
- Frontend: type-check, production build

Extend with deploy steps for your cloud provider (ECS, Railway, Fly.io, etc.).

## Reverse proxy example (nginx)

```nginx
server {
  listen 443 ssl;
  server_name app.example.com;

  location / {
    proxy_pass http://frontend:3000;
  }
}

server {
  listen 443 ssl;
  server_name api.example.com;

  location / {
    proxy_pass http://backend:3001;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Set `TRUST_PROXY=true` and `CORS_ORIGINS=https://app.example.com` on the backend.

## Rollback

1. `docker compose down`
2. Restore PostgreSQL snapshot from backup
3. Deploy previous image tag: `docker compose up -d backend:previous-tag`

## Health monitoring

- **Liveness**: `GET /api/health` — returns 200 when API is up
- **Readiness**: `GET /api/ready` — includes database connectivity
- Docker `HEALTHCHECK` on backend container uses `/api/health`

## Scaling notes

- Backend is stateless; scale horizontally behind a load balancer
- AI metrics are in-process; use external APM for multi-instance aggregation
- PDF generation is CPU-heavy; consider a dedicated worker if volume is high
