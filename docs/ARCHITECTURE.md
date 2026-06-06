# Architecture — Lawyered Will Maker

## Overview

Lawyered Will Maker is a monorepo application that guides users through creating a will via conversational AI. The backend owns persistence, extraction, validation, and PDF export; the frontend provides the live will builder UI.

```
┌─────────────┐     HTTPS/REST      ┌──────────────────┐
│  Next.js    │ ◄─────────────────► │  NestJS API      │
│  Frontend   │                     │  (apps/backend)  │
└─────────────┘                     └────────┬─────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
             ┌────────────┐          ┌────────────┐          ┌────────────┐
             │ PostgreSQL │          │  OpenAI    │          │ Puppeteer  │
             │  (TypeORM) │          │ GPT-4o-mini│          │ (PDF HTML) │
             └────────────┘          └────────────┘          └────────────┘
```

## Core domains

| Module | Responsibility |
|--------|----------------|
| **Auth** | JWT registration/login, password hashing (bcrypt) |
| **Users** | User profile, sanitized API responses |
| **Wills** | CRUD, chat orchestration, snapshots, validation |
| **AI** | JSON extraction contract, retries, circuit breaker, fallback heuristics |
| **PDF** | HTML templates rendered to PDF via headless Chromium |
| **Health / Metrics** | DB readiness probes, in-process AI cost counters |

## Data model

- **Relational tables** store users, wills, beneficiaries, assets, executors, guardians, witnesses, chat messages, and versioned snapshots.
- **Will snapshot JSON** is the source of truth for the AI conversation loop (testator info, allocations, memory fields like `askedQuestions`).
- Snapshots are persisted on each chat turn; relational fields are updated where applicable.

## AI extraction flow

1. User sends a chat message.
2. `ChatService` loads the latest snapshot and calls `AiService.extractFromMessage`.
3. OpenAI returns structured JSON (updates, ambiguities, next question, confidence).
4. Low-confidence extractions are gated; clarifications are tracked in snapshot memory.
5. `UpdateApplierService` merges partial updates; `ValidationService` checks legal completeness rules.
6. A new snapshot is persisted; assistant reply is saved to chat history.

## Security

- Helmet security headers, compression, global validation pipe
- Rate limiting (`@nestjs/throttler`) — stricter on auth endpoints
- JWT guard on protected routes; passwords never returned from API
- CORS restricted to configured origins
- Production: `TYPEORM_SYNCHRONIZE=false`, migrations via `RUN_MIGRATIONS=true`

## Deployment topology

- **Development**: `docker-compose up` with schema sync enabled
- **Production**: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
  - Migrations run on container start
  - Optional `RUN_SEED=true` for demo data on first deploy
  - Health checks at `/api/health` and `/api/ready`

## Observability

- Structured JSON request logging via `LoggingInterceptor`
- Global exception filter with severity-based logging
- `/api/metrics` — in-process AI token/cost summary (reset on restart)

## Technology choices

| Choice | Rationale |
|--------|-----------|
| **GPT-4o-mini** | Low cost (~$0.15/1M input tokens), sufficient for structured JSON extraction |
| **Snapshot JSON** | Flexible schema for iterative AI updates without frequent migrations |
| **Puppeteer** | Reliable HTML→PDF without external SaaS dependency |
| **NestJS** | Modular structure, guards, pipes, and TypeORM integration |
