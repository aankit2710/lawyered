# Phase 3 Completion — AI Extraction Engine (Core)

**Status**: ✅ COMPLETE  
**Date**: 2026-06-06  
**Scope**: OpenAI-backed extraction, structured JSON contract, chat endpoint, fallback heuristics, tests, token/cost tracking

---

## Summary

Phase 3 converts plain-English will instructions into structured snapshot updates. The backend loads the latest snapshot, runs AI extraction on the latest message only, validates the response contract, persists chat history and snapshots, and returns structured JSON with confidence, ambiguities, and follow-up questions.

---

## Completed Work

### 3.1 — OpenAI Integration
- [x] `openai` package installed and configured
- [x] API key via `OPENAI_API_KEY`, model via `OPENAI_MODEL` (default `gpt-4o-mini`)
- [x] JSON-mode structured outputs (`response_format: { type: 'json_object' }`)
- [x] Exponential backoff retry for 429/5xx/network errors (`OPENAI_MAX_RETRIES`, `OPENAI_RETRY_BASE_DELAY_MS`)
- [x] Deterministic fallback when API key is missing or all retries fail

**Files**:
- `apps/backend/src/modules/ai/ai.service.ts`
- `apps/backend/src/modules/ai/ai.module.ts`

### 3.2 — Extraction Prompt Design
- [x] System prompt defines extraction-only behaviour (not a chatbot)
- [x] Snapshot + latest message as sole context input
- [x] Prompt versioning via `EXTRACTION_PROMPT_VERSION` (`v1.1.0`)
- [x] Sample inputs covered by unit tests (see § Testing)

**Files**:
- `apps/backend/src/modules/ai/extraction-contract.ts`

#### Prompt versioning strategy
| Version | Change |
|---------|--------|
| `v1.0.0` | Initial extraction contract |
| `v1.1.0` | Added `replace` support, prompt version header, stricter validation |

Bump `EXTRACTION_PROMPT_VERSION` when the system prompt or JSON contract changes materially. The version is logged and stored in chat metadata.

### 3.3 — AI Service Implementation
- [x] `AiService.extractFromMessage(snapshot, message)`
- [x] Request builder: system prompt + `{ currentSnapshot, latestMessage }`
- [x] Parse and normalize OpenAI JSON output
- [x] Structured logging (attempts, validation failures, token usage)
- [x] Token counting and per-message cost estimate

**Cost tracking**:
```typescript
usage: {
  model: 'gpt-4o-mini',
  promptTokens: 800,
  completionTokens: 200,
  totalTokens: 1000,
  estimatedCostUsd: 0.00024
}
```

### 3.4 — Structured JSON Response Contract
- [x] Contract fields: `updates`, `missingFields`, `ambiguities`, `nextQuestion`, `confidence`, `replace`
- [x] Runtime validation via `validateExtractionContract()`
- [x] Invalid model output → fallback heuristics (never trusts malformed JSON)
- [x] Documented in this file and `extraction-contract.ts`

### 3.5 — Chat Message Endpoint
- [x] `POST /api/wills/:willId/chat`
- [x] DTO validation (`ChatRequestDto`)
- [x] JWT protected
- [x] Stores user + assistant messages with extraction metadata
- [x] Persists updated snapshot via `ChatService` → `UpdateApplier` → `SnapshotService`
- [x] Returns structured response including `extraction`, `snapshot`, `gated`, `pendingClarification`

**Files**:
- `apps/backend/src/modules/wills/wills.controller.ts`
- `apps/backend/src/modules/wills/chat.service.ts`
- `apps/backend/src/modules/wills/dto/chat-request.dto.ts`

### 3.6 — Testing & Validation
- [x] Unit test: simple asset extraction (`My house goes to my son`)
- [x] Unit test: multiple beneficiary extraction with equal split
- [x] Unit test: ambiguity detection (`My son gets everything`)
- [x] Contract validation + cost estimation tests
- [x] Integration test: full chat flow (mocked services)
- [x] Cost tracking: `estimatedCostUsd` per message when OpenAI is used

**Run tests**:
```bash
cd apps/backend
npm run test:phase3
```

**Test files**:
- `apps/backend/test/ai/ai-fallback.spec.ts`
- `apps/backend/test/ai/extraction-contract.spec.ts`
- `apps/backend/test/wills/chat.service.spec.ts`

### 3.7 — Frontend Integration
- [x] Live Will Builder chat panel (Phase 7) posts to `/chat`
- [x] Displays confidence and follow-up hints

**Files**:
- `apps/frontend/src/components/will-builder/ChatPanel.tsx`
- `apps/frontend/src/hooks/useChat.ts`

---

## Response Contract

```json
{
  "updates": {},
  "replace": {},
  "missingFields": [],
  "ambiguities": [],
  "nextQuestion": "",
  "confidence": 0.95,
  "usage": {
    "model": "gpt-4o-mini",
    "promptTokens": 800,
    "completionTokens": 200,
    "totalTokens": 1000,
    "estimatedCostUsd": 0.00024
  },
  "promptVersion": "v1.1.0"
}
```

---

## Architecture

```
POST /wills/:willId/chat
        ↓
   ChatService.processMessage
        ↓
   AiService.extractFromMessage(snapshot, message)
        ├─ OpenAI (retry + validate + token log)
        └─ fallback heuristics (no API key / failure)
        ↓
   UpdateApplier.apply (if not gated — Phase 6)
        ↓
   SnapshotService.persistSnapshot
        ↓
   Return { message, extraction, snapshot }
```

### Memory strategy
Only **snapshot + latest message** are sent to the AI — not full chat history.

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI authentication | — |
| `OPENAI_MODEL` | Model name | `gpt-4o-mini` |
| `OPENAI_MAX_RETRIES` | Retry attempts | `3` |
| `OPENAI_RETRY_BASE_DELAY_MS` | Base backoff delay | `400` |

---

## Verification Checklist

- [x] `npm run test:phase3` — 8 tests pass
- [x] `npm run build` in backend
- [x] Chat endpoint returns structured JSON with confidence
- [x] Messages stored in `chat_messages` table
- [x] Token usage logged and stored in message metadata

---

## Next Phases

- **Phase 4** — Formal snapshot lifecycle (`SnapshotService`, `UpdateApplier`) ✅
- **Phase 6** — Ambiguity gating, clarify endpoint ✅
- **Phase 7** — Live Will Builder UI ✅
