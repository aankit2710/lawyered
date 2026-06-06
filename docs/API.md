# API Reference

Base URL: `http://localhost:3001/api` (development)

Authentication: Bearer JWT in `Authorization` header for protected routes.

## Health & monitoring

### `GET /health`

Returns service status including database connectivity.

### `GET /ready`

Readiness probe — `ready: true` when database is reachable.

### `GET /metrics`

Requires JWT. In-process AI usage summary (tokens, estimated cost, request counts).

## Auth

### `POST /auth/register`

```json
{
  "email": "user@example.com",
  "password": "SecurePass1",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Password rules: min 8 chars, uppercase, lowercase, and digit.

### `POST /auth/login`

```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

Response: `{ "access_token": "...", "user": { ... } }`

### `GET /auth/me`

Requires JWT. Returns sanitized user profile.

## Wills

All will routes require JWT.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/wills` | List user's wills |
| `POST` | `/wills` | Create new will |
| `GET` | `/wills/:id` | Get will details |
| `PATCH` | `/wills/:id` | Update will metadata |
| `DELETE` | `/wills/:id` | Delete will |
| `POST` | `/wills/:id/chat` | Send chat message (AI extraction) |
| `POST` | `/wills/:id/clarify` | Answer clarification question |
| `GET` | `/wills/:id/snapshot` | Latest snapshot state |
| `GET` | `/wills/:id/validation` | Validation report |
| `GET` | `/wills/:id/messages` | Chat history |
| `GET` | `/wills/:id/pdf` | Download PDF |
| `GET` | `/wills/:id/pdf/preview` | HTML preview |

### Chat request

```json
{
  "message": "I want to leave my house to my daughter Sarah"
}
```

Response includes `message`, `snapshot`, `extraction`, `gated`, `pendingClarification`.

## Error format

```json
{
  "statusCode": 400,
  "path": "/api/auth/login",
  "method": "POST",
  "timestamp": "2026-06-06T12:00:00.000Z",
  "message": "Invalid credentials"
}
```

## Rate limits

- Global: 100 requests/minute per IP (configurable via `THROTTLE_LIMIT`)
- Auth endpoints: 10 requests/minute per IP
