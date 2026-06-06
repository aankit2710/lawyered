# Lawyered Will Maker

AI-assisted will builder. Chat with the app to describe your wishes; it extracts structured data, validates completeness, and exports a PDF.

**Stack:** Next.js · NestJS · PostgreSQL · OpenAI GPT-4o-mini · Docker

---

## What you need

| Tool | Version |
|------|---------|
| Node.js | 20+ (local dev) |
| Docker + Docker Compose | v2+ (recommended) |
| OpenAI API key | Required for AI chat ([get one here](https://platform.openai.com/api-keys)) |

---

## Quick start (Docker — recommended)

### 1. Clone and configure

```bash
cd "lowyer test"          # your project folder
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=change-this-to-a-long-random-string
```

### 2. Start everything

```bash
docker compose up -d --build
```

Wait ~30 seconds for Postgres, migrations, and the API to come up.

| Service | URL |
|---------|-----|
| **App (frontend)** | http://localhost:3000 |
| **API** | http://localhost:3001/api |
| **Health check** | http://localhost:3001/api/ready |

### 3. Load demo data (optional)

```bash
docker compose exec backend node dist/database/seed.js
```

Or seed on first deploy with production compose:

```bash
npm run docker:prod:seed
```

### 4. Open the app

1. Go to **http://localhost:3000**
2. Log in with the demo account:

   | Email | Password |
   |-------|----------|
   | `demo@lawyered.com` | `Demo@Lawyered1` |

   Or click **Register** to create your own account.

### 5. Use the Will Builder

1. Open the **Dashboard** after login.
2. Select a will from the dropdown (demo account has 5 sample wills) or click **Start Will** / **New Will**.
3. **Chat** on the left — describe assets, beneficiaries, executor, etc.
4. Watch the **live preview** update on the right.
5. Check **Progress** and **Validation** panels for missing items.
6. When validation passes, use **PDF Export** to download or preview your will.

> **Tip:** Try the demo will **"Ambiguity Example Will"** to see how the AI asks clarifying questions.

---

## Local development (without full Docker stack)

Use this if you want hot reload while editing code.

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Ensure these match local Postgres:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres_dev_password
DB_NAME=lawyered
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=dev-secret-change-me
NEXT_PUBLIC_API_URL=http://localhost:3001/api
TYPEORM_SYNCHRONIZE=true
```

### 3. Start PostgreSQL

```bash
docker run --name lawyered-postgres \
  -e POSTGRES_PASSWORD=postgres_dev_password \
  -e POSTGRES_DB=lawyered \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Run backend + frontend

**Option A — one command (from project root):**

```bash
npm run dev
```

**Option B — two terminals:**

```bash
# Terminal 1 — API (port 3001)
npm run dev:backend

# Terminal 2 — UI (port 3000)
npm run dev:frontend
```

### 6. Open http://localhost:3000

Same login and Will Builder flow as above.

---

## Production deployment

```bash
cp .env.example .env
```

Set production values:

| Variable | Example |
|----------|---------|
| `JWT_SECRET` | Strong random string (32+ chars) |
| `DB_PASSWORD` | Strong database password |
| `OPENAI_API_KEY` | Your OpenAI key |
| `CORS_ORIGINS` | `https://your-frontend.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com/api` |

Deploy:

```bash
npm run docker:prod
```

Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## Common commands

```bash
# Docker
docker compose up -d              # Start (dev-style compose)
docker compose down               # Stop
docker compose logs -f backend    # View API logs
npm run docker:prod               # Production stack

# Database
npm run db:seed                   # Seed demo user + wills (host)
npm run db:seed:reset             # Wipe and re-seed demo data
cd apps/backend && npm run db:migrate   # Run migrations manually

# Build & test
npm run build                     # Build backend + frontend
npm run test                      # Run backend tests
cd apps/backend && npm run test:phases   # 26 phase unit tests
npm run lint                      # Lint both apps
```

---

## Environment variables

Copy from `.env.example`. Key variables:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Powers AI extraction (required for chat) |
| `JWT_SECRET` | Signs auth tokens — **must change in production** |
| `DB_*` | PostgreSQL connection |
| `NEXT_PUBLIC_API_URL` | API URL used by the browser |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) |
| `TYPEORM_SYNCHRONIZE` | `true` for local dev auto-schema; `false` in production |
| `RUN_MIGRATIONS` | `true` to apply DB migrations on container start |

See `.env.example` for the full list.

---

## API quick reference

```bash
# Health (returns 503 if database is down)
curl http://localhost:3001/api/ready

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"SecurePass1"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@lawyered.com","password":"Demo@Lawyered1"}'
```

Full API docs: [docs/API.md](docs/API.md)

---

## Project structure

```
├── apps/
│   ├── backend/       # NestJS API (auth, wills, AI, PDF)
│   └── frontend/      # Next.js Will Builder UI
├── docs/              # Architecture, deployment, API, demo guide
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Features

- Conversational will creation with GPT-4o-mini
- Live will preview and validation engine
- Clarification flow when the AI is uncertain
- PDF export (standard / detailed / simplified)
- JWT authentication
- Demo data with 5 sample wills
- Production hardening: rate limiting, helmet, migrations, CI

---

## Documentation

| Doc | What's inside |
|-----|----------------|
| [DEMO.md](docs/DEMO.md) | Demo wills and testing checklist |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deploy, nginx, rollback |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the system works |
| [API.md](docs/API.md) | All endpoints |
| [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common errors and fixes |
| [PRODUCTION_AUDIT.md](docs/PRODUCTION_AUDIT.md) | Security & readiness audit |
| [COST_ANALYSIS.md](docs/COST_ANALYSIS.md) | OpenAI cost estimates |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| AI not responding | Set `OPENAI_API_KEY` in `.env` and restart backend |
| `db:seed` fails on host | Use `DB_HOST=localhost` in `.env` (not `postgres`) |
| CORS errors | Set `CORS_ORIGINS=http://localhost:3000` |
| Port in use | Change `BACKEND_PORT` / `FRONTEND_PORT` in `.env` |
| Docker build fails | `docker compose build --no-cache` |

More: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## License

MIT
