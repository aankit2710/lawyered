# Phase 6 Completion — Advanced AI Extraction Engine

**Status**: ✅ COMPLETE  
**Date**: 2026-06-06  
**Scope**: Ambiguity detection, confidence gating, clarification flow, change-of-mind handling, backend tests

---

## Summary

Phase 6 extends the AI extraction engine so it can detect ambiguous input, score confidence, gate low-confidence updates, ask follow-up questions without looping, and apply corrections via `replace` semantics. Users answer clarifications through a dedicated endpoint while the snapshot retains memory metadata.

---

## Completed Work

### 6.1 — Ambiguity Detection
- [x] AI system prompt requests `ambiguities[]` in structured JSON output
- [x] Fallback heuristics flag vague beneficiary references
- [x] Ambiguities surfaced in chat response and frontend

**Files**:
- `apps/backend/src/modules/ai/ai.service.ts`
- `apps/backend/src/modules/wills/memory/will-snapshot-state.ts`

### 6.2 — Confidence Scoring
- [x] `confidence` field (0–1) in extraction contract
- [x] Low-confidence extractions gated when confidence < 0.7 and ambiguities/missing fields exist
- [x] Confidence logged in `ChatService` and `ClarifyService`
- [x] Confidence stored in chat message metadata

**Files**:
- `apps/backend/src/modules/wills/chat.service.ts`
- `apps/backend/src/modules/wills/clarify.service.ts`

### 6.3 — Next Question Generation
- [x] `nextQuestion` prioritized: ambiguities → missing fields → defaults
- [x] `askedQuestions` tracked in snapshot to prevent repeated prompts
- [x] `lastNextQuestion` used to avoid assistant message loops

### 6.4 — Change of Mind Handling
- [x] `replace` object in extraction contract for full section replacement
- [x] `UpdateApplierService` applies `replace` with last-wins semantics
- [x] Partial merges for executor backup fields via `updates.executor`

**Files**:
- `apps/backend/src/modules/wills/update-applier.service.ts`

### 6.5 — Clarification Requests
- [x] `POST /api/wills/:willId/clarify` endpoint
- [x] Requires active `pendingClarification` on snapshot
- [x] Re-extracts from user clarification and updates snapshot
- [x] Clears pending state when confidence is sufficient
- [x] Persists user + assistant chat messages
- [x] Returns `message` for frontend chat display

**Files**:
- `apps/backend/src/modules/wills/clarify.service.ts`
- `apps/backend/src/modules/wills/dto/clarify-request.dto.ts`
- `apps/backend/src/modules/wills/wills.controller.ts`

### 6.6 — Snapshot Memory Fields
- [x] `askedQuestions: string[]`
- [x] `lastNextQuestion?: string`
- [x] `pendingClarification?: { ambiguity?, question, createdAt }`

### 6.7 — Backend Tests
- [x] Executor replacement via `replace.executor`
- [x] Beneficiary replacement via `replace.beneficiaries`
- [x] Equal asset split allocations
- [x] Multi-child equal inheritance
- [x] Backup executor merge
- [x] Contradictory statements (last-wins replace)

**Files**:
- `apps/backend/test/wills/update-applier.spec.ts`
- `apps/backend/jest.config.phase6.js`

Run tests:
```bash
cd apps/backend
npx jest --config jest.config.phase6.js
```

### 6.8 — Frontend Integration (Phase 7)
- [x] Clarification banner in `ChatPanel` when `pendingClarification` is set
- [x] `useClarify` hook routes clarification answers to `/clarify`
- [x] Confidence displayed on assistant messages

**Files**:
- `apps/frontend/src/hooks/useChat.ts`
- `apps/frontend/src/components/will-builder/ChatPanel.tsx`
- `apps/frontend/src/components/will-builder/WillBuilder.tsx`

---

## Extraction Contract (Phase 6)

```json
{
  "updates": {},
  "replace": {},
  "missingFields": [],
  "ambiguities": [],
  "nextQuestion": "",
  "confidence": 0.95
}
```

### Gating Logic

```
confidence < 0.7 AND (ambiguities OR missingFields)
  → do NOT apply updates
  → set pendingClarification
  → return clarifying question

otherwise
  → apply updates/replace via UpdateApplier
  → clear pendingClarification
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/wills/:willId/chat` | POST | Send interview message; may gate low-confidence extractions |
| `/api/wills/:willId/clarify` | POST | Answer a pending clarification question |

---

## Architecture

```
User message
    ↓
ChatService / ClarifyService
    ↓
AiService.extractFromMessage(snapshot, message)
    ↓
confidence gate?
    ├─ yes → pendingClarification + question (no snapshot legal changes)
    └─ no  → UpdateApplier.apply(snapshot, extraction)
                ↓
           SnapshotService.persistSnapshot
```

---

## Next Phase

**Phase 7** — Live Will Builder UI (two-panel chat + preview) — ✅ Complete  
**Phase 8** — PDF generation and export
