# Cost Analysis

## AI model: GPT-4o-mini

| Metric | Estimate |
|--------|----------|
| Input tokens | ~$0.15 / 1M tokens |
| Output tokens | ~$0.60 / 1M tokens |
| Typical extraction turn | 800–2,500 tokens |
| Cost per chat turn | ~$0.0002–$0.0015 USD |

## Typical will completion

| Scenario | Chat turns | Est. tokens | Est. cost |
|----------|------------|-------------|-----------|
| Simple will | 8–12 | ~15,000 | ~$0.01 |
| Complex (guardians, multiple assets) | 20–30 | ~45,000 | ~$0.03 |
| With clarifications | 25–40 | ~60,000 | ~$0.05 |

## Infrastructure (self-hosted Docker)

| Component | Monthly estimate (small scale) |
|-----------|------------------------------|
| VPS (2 vCPU, 4GB RAM) | $12–24 |
| Managed Postgres (optional) | $15–30 |
| OpenAI (100 wills/month) | ~$3–5 |
| **Total** | **~$30–60/month** |

## Cost controls implemented

- GPT-4o-mini as default model (10–20× cheaper than GPT-4 Turbo)
- Token usage logged per extraction turn
- `/api/metrics` endpoint for runtime cost tracking
- Circuit breaker: stops OpenAI calls after repeated failures (uses free fallback)
- Exponential backoff on transient API errors

## Monitoring costs

```bash
curl http://localhost:3001/api/metrics
```

```json
{
  "timestamp": "2026-06-06T12:00:00.000Z",
  "ai": {
    "totalRequests": 42,
    "openAiRequests": 38,
    "fallbackRequests": 4,
    "totalTokens": 52000,
    "estimatedCostUsd": 0.0124,
    "averageTokensPerRequest": 1368,
    "model": "gpt-4o-mini"
  }
}
```

Set billing alerts in the [OpenAI dashboard](https://platform.openai.com/settings/organization/billing) for production.

## Model rationale

GPT-4o-mini is optimal for this use case because:

1. Extraction is structured JSON, not open-ended legal advice
2. Fallback heuristics cover API outages
3. Quality difference vs GPT-4 Turbo is minimal for field extraction
4. At scale (1,000 wills/month), cost stays under ~$50 for AI alone
