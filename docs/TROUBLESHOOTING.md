# Troubleshooting

## Backend won't start

**Symptom**: Container exits immediately.

1. Check logs: `docker compose logs backend`
2. Verify Postgres is healthy: `docker compose ps`
3. Confirm `DB_*` variables match postgres service
4. If migrations fail, run manually: `docker compose exec backend node dist/database/migrate.js`

## Database connection errors

```
Error: connect ECONNREFUSED
```

- Ensure `DB_HOST=postgres` inside Docker (not `localhost`)
- Local dev without Docker: use `DB_HOST=localhost`
- Wait for postgres healthcheck before backend starts

## OpenAI / AI not responding

**Symptom**: All replies use fallback heuristics.

1. Verify `OPENAI_API_KEY` is set and valid
2. Check `/api/metrics` for `fallbackRequests` spike
3. Circuit breaker may be open after failures — wait 60s or restart backend
4. Review logs for rate limit or billing errors

## PDF generation fails

**Symptom**: 500 on `/wills/:id/pdf`

- Docker image includes Chromium; local Windows may need Chrome installed
- Set `PUPPETEER_EXECUTABLE_PATH` if Chromium is in a non-standard location
- Ensure sufficient memory (PDF needs ~200MB per render)

## CORS errors in browser

```
Access-Control-Allow-Origin
```

- Set `CORS_ORIGINS` to your frontend URL (exact match, include protocol)
- Multiple origins: comma-separated list
- Rebuild/restart backend after env change

## Auth / JWT issues

- `401 Unauthorized`: token expired or invalid — re-login
- `403` on will routes: will belongs to another user
- Production: use a strong `JWT_SECRET` (never use default)

## Rate limiting (429)

- Auth: 10 req/min per IP
- Global: 100 req/min per IP
- Adjust `THROTTLE_LIMIT` and `THROTTLE_TTL_MS` if needed

## Migration / schema issues

**Development**: `TYPEORM_SYNCHRONIZE=true` auto-updates schema.

**Production**: `TYPEORM_SYNCHRONIZE=false` + `RUN_MIGRATIONS=true`.

If tables are missing after deploy:

```bash
docker compose exec backend node dist/database/migrate.js
```

## Frontend can't reach API

- `NEXT_PUBLIC_API_URL` must be the URL the **browser** uses (not internal Docker hostname)
- For Docker local: `http://localhost:3001/api`
- Rebuild frontend after changing `NEXT_PUBLIC_API_URL`

## CI failures

- Phase tests don't need a live DB for most suites
- Ensure `JWT_SECRET` is set in CI env
- Run locally: `cd apps/backend && npm run test:phases`

## Getting help

1. `GET /api/health` and `GET /api/ready`
2. `docker compose logs -f backend`
3. Check `docs/DEPLOYMENT.md` for production checklist
