# Lawyered Will Maker

AI-assisted Will Maker using Next.js, NestJS, PostgreSQL, and GPT-4o-mini

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **Backend**: NestJS + PostgreSQL + TypeORM
- **AI**: OpenAI GPT-4o-mini
- **Infrastructure**: Docker + Docker Compose

## Project Structure

```
lawyered-will-maker/
├── apps/
│   ├── backend/          # NestJS Backend API
│   ├── frontend/         # Next.js Frontend
│   └── shared/           # Shared types and utilities
├── docs/                 # Documentation
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile.backend    # Backend Docker image
├── Dockerfile.frontend   # Frontend Docker image
├── package.json          # Root package with workspaces
└── tsconfig.json         # Root TypeScript configuration
```

## Quick Start

### Prerequisites

- Node.js 18+ (if running locally)
- Docker and Docker Compose (for containerized setup)
- npm or yarn

### Option 1: Docker (Recommended - One Command)

```bash
# Clone and navigate to project
cd lawyered-will-maker

# Start all services with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Database: localhost:5432
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start PostgreSQL (requires Docker)
docker run --name postgres -e POSTGRES_PASSWORD=postgres_dev_password -p 5432:5432 -d postgres:16-alpine

# Run migrations and seed data
npm run db:migrate

# Start development servers in separate terminals
npm run dev:backend
npm run dev:frontend
```

## Environment Variables

See `.env.example` for all required environment variables:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=lawyered
DB_USER=postgres
DB_PASSWORD=postgres_dev_password

# Backend
BACKEND_PORT=3001
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=24h

# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Application
NODE_ENV=development
```

## Development

### Backend (NestJS)

```bash
cd apps/backend

# Install dependencies
npm install

# Development with hot reload
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

**Backend API Documentation**: http://localhost:3001/api

### Frontend (Next.js)

```bash
cd apps/frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

**Frontend**: http://localhost:3000

## Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Restart services
docker-compose restart

# Reset everything (remove volumes)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Enter database shell
docker-compose exec postgres psql -U postgres -d lawyered

# View running services
docker-compose ps
```

## Database

### Migrations

```bash
# From backend directory
npm run typeorm migration:generate -- src/migrations/InitialSchema
npm run typeorm migration:run
npm run typeorm migration:revert
```

### Database Connection

- **Host**: localhost (or postgres if using Docker)
- **Port**: 5432
- **User**: postgres
- **Password**: postgres_dev_password
- **Database**: lawyered

Connect with pgAdmin or DBeaver using these credentials.

## API Endpoints

### Health Check

```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-06-05T10:30:00Z"
}
```

### Welcome

```bash
GET /api
```

Response:
```json
{
  "message": "Welcome to Lawyered Will Maker API v0.1.0"
}
```

## Features (Phase 0)

✅ Project structure with monorepo setup
✅ NestJS backend with TypeORM
✅ Next.js frontend with Tailwind CSS
✅ PostgreSQL database with Docker
✅ Docker Compose for single-command startup
✅ ESLint and Prettier configuration
✅ TypeScript configuration
✅ Health check endpoints
✅ Environment configuration

## Next Steps

- **Phase 1**: Authentication (Register, Login, JWT)
- **Phase 2**: Database schema design
- **Phase 3**: AI extraction engine
- **Phase 4**: Conversation memory and snapshots
- **Phase 5**: Validation engine

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Type Checking

```bash
npm run type-check
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
netstat -tlnp | grep 3000

# Kill process (Linux/Mac)
kill -9 <PID>

# Or change port in .env
BACKEND_PORT=3002
FRONTEND_PORT=3001
```

### Database Connection Error

1. Ensure PostgreSQL is running:
   ```bash
   docker-compose exec postgres pg_isready
   ```

2. Check database credentials in `.env`

3. Verify network connectivity:
   ```bash
   docker-compose exec backend ping postgres
   ```

### Docker Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild images
docker-compose build --no-cache

# Start services
docker-compose up -d
```

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

**Last Updated**: 2026-06-05
**Version**: 0.1.0
