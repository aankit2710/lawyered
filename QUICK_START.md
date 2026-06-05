# Quick Reference - Phase 0 Setup Complete ✅

## One-Line Startup (Docker)

```bash
docker-compose up -d
```

## Access Points

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:3001/api | 3001 |
| Backend Health | http://localhost:3001/api/health | 3001 |
| Database | localhost:5432 | 5432 |

## Database Credentials

- **User**: postgres
- **Password**: postgres_dev_password
- **Database**: lawyered
- **Host**: localhost (or postgres via Docker)

## Useful Commands

### Docker
```bash
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
docker-compose logs -f         # View all logs
docker-compose ps              # Show running services
docker-compose restart         # Restart services
```

### Development
```bash
npm install                    # Install dependencies
npm run dev:backend            # Backend dev server
npm run dev:frontend           # Frontend dev server
npm run lint                   # Lint all code
npm run format                 # Format all code
```

### Building
```bash
npm run build:backend          # Build backend
npm run build:frontend         # Build frontend
npm run build                  # Build all
```

## Project Structure

```
lawyered-will-maker/
├── apps/
│   ├── backend/      → NestJS API (port 3001)
│   ├── frontend/     → Next.js UI (port 3000)
│   └── shared/       → Shared types
├── docs/             → Documentation
├── docker-compose.yml
└── README.md         → Full documentation
```

## Key Files

- **docker-compose.yml** - Start all services
- **README.md** - Complete documentation
- **.env** - Environment variables
- **apps/backend/src/main.ts** - Backend entry point
- **apps/frontend/src/app/page.tsx** - Frontend homepage

## Troubleshooting

### Port in use?
```bash
# Find what's using the port
netstat -tlnp | grep 3000
# Kill it
kill -9 <PID>
```

### Docker issues?
```bash
# Clean everything
docker-compose down -v
docker system prune -a

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### Database connection failed?
```bash
# Check if database is healthy
docker-compose exec postgres pg_isready

# Check logs
docker-compose logs postgres
```

## Next Phase

**Phase 1 - Authentication**: Register, Login, JWT tokens
- Estimated time: 3-4 days
- See: `docs/PROJECT_PHASE_WISE_TODO_LIST.md`

---

**Status**: ✅ Phase 0 Complete
**Date**: 2026-06-05
**Git Branch**: master
