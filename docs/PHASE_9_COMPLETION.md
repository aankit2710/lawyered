# Phase 9 Completion — Demo Data & Testing Setup

**Status**: ✅ COMPLETE  
**Date**: 2026-06-06

---

## Summary

Phase 9 enables instant reviewer testing with a seeded demo account, five sample wills, chat history, and snapshots.

---

## Demo Account

| Field | Value |
|-------|-------|
| Email | `demo@lawyered.com` |
| Password | `Demo@Lawyered1` |

Configured in `.env.example` as `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD`.

---

## Seed Script

```bash
# From project root
npm run db:seed

# Reset and re-seed
npm run db:seed:reset
```

**Files**:
- `apps/backend/src/database/seed.ts`
- `apps/backend/src/database/data-source.ts`

---

## Sample Data

| Will | Completion | Demonstrates |
|------|------------|--------------|
| Partial Will (In Progress) | ~30% | Incomplete interview |
| Complete Family Will | 100% | Full PDF export |
| Ambiguity Example Will | ~40% | Pending clarification |
| Complex Allocation Will | ~85% | Equal split + backup executor |
| Guardianship Will | ~75% | Minor + guardian |

Each will includes:
- Snapshot JSON in `will_snapshots`
- Sample chat messages in `chat_messages`

---

## Documentation

- [DEMO.md](./DEMO.md) — credentials, scenarios, checklist, troubleshooting
- [README.md](../README.md) — updated quick start with demo login

---

## Testing Checklist (manual)

See [DEMO.md](./DEMO.md) for the full reviewer checklist covering login, chat, validation, PDF, and UI.
