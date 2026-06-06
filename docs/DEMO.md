# Lawyered Will Maker — Demo Guide

## Quick start

```bash
# 1. Start services
docker-compose up -d
# or locally: npm install && npm run dev

# 2. Seed demo data
npm run db:seed

# 3. Open the app
# http://localhost:3000
```

## Demo credentials

| Field | Value |
|-------|-------|
| Email | `demo@lawyered.com` |
| Password | `Demo@Lawyered1` |

Override via `.env`:
```env
DEMO_USER_EMAIL=demo@lawyered.com
DEMO_USER_PASSWORD=Demo@Lawyered1
```

## Sample wills (after seed)

| Will | Purpose |
|------|---------|
| **Partial Will (In Progress)** | ~30% complete — testator only, AI asks for executor |
| **Complete Family Will** | 100% complete — PDF export ready |
| **Ambiguity Example Will** | Pending clarification — "which son?" |
| **Complex Allocation Will** | Equal split + backup executor |
| **Guardianship Will** | Minor beneficiary + guardian |

## Testing checklist

- [ ] Login with demo account
- [ ] Open **Complete Family Will** and download PDF
- [ ] Preview PDF before download (Standard / Detailed / Simplified)
- [ ] Chat on **Partial Will** and watch validation update
- [ ] Answer clarification on **Ambiguity Example Will**
- [ ] Check progress tracker and validation panel
- [ ] Toggle dark/light theme
- [ ] Create a new will from dashboard

## Reset demo data

```bash
npm run db:seed:reset
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Cannot login | Run `npm run db:seed` |
| PDF fails | Ensure Chromium/Puppeteer is installed; on Docker see `PUPPETEER_EXECUTABLE_PATH` |
| Empty will list | Seed script may not have run — check DB connection in `.env` |
| AI not responding | Set `OPENAI_API_KEY` in `.env` (fallback heuristics work without it) |
