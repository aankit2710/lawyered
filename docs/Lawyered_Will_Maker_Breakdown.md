# Lawyered Will Maker - Technical Breakdown

## Recommendation

Use a hybrid AI architecture:

- Deterministic interview flow
- Small LLM (GPT-4o-mini / Claude Haiku) for extraction only
- Rule engine for validation
- Template engine for document generation

This satisfies the assignment while keeping cost low.

---

# Architecture

```text
NextJS
   |
NestJS API
   |
+-------------------+
|                   |
Postgres        LLM Service
                (GPT-4o-mini)
```

---

# Phase 1 - Authentication

Endpoints:

POST /auth/register
POST /auth/login

Requirements:

- JWT authentication
- bcrypt password hashing
- User can resume unfinished wills

Tables:

- users

---

# Phase 2 - Database Design

Tables:

- users
- wills
- beneficiaries
- assets
- asset_allocations
- executors
- guardians
- witnesses
- chat_messages
- will_snapshots

Important table:

asset_allocations

```sql
id
asset_id
beneficiary_id
percentage
```

Supports:

- House -> Son A 50%, Son B 50%
- Cash -> Wife 70%, Daughter 30%

---

# Phase 3 - AI Interview Engine

Responsibilities:

1. Extract facts
2. Identify missing information
3. Generate next question

Example Input:

"My house in Pune and 30 lakhs should be split between my sons Rahul and Rohit."

Example Output:

```json
{
  "assets": [],
  "beneficiaries": [],
  "missingFields": [],
  "nextQuestion": ""
}
```

Do NOT let AI:

- Validate wills
- Generate PDFs
- Store memory

---

# Phase 4 - Memory Strategy

Do not resend full chat history.

Store snapshot after every message:

```json
{
  "person": {},
  "assets": [],
  "beneficiaries": [],
  "executor": {},
  "guardian": {},
  "witnesses": []
}
```

Send:

Current Snapshot + Latest User Message

Benefits:

- Lower token cost
- Faster responses
- Better production design

---

# Phase 5 - Validation Engine

Separate service.

Errors:

- Missing executor
- Less than two witnesses
- Asset allocation not equal to 100%
- Minor child without guardian

Warnings:

- Witness is also beneficiary

States:

- INCOMPLETE
- INVALID
- VALID_WITH_WARNINGS
- COMPLETE

---

# Phase 6 - Will Generation

Generate HTML template.

Convert:

HTML -> PDF

Recommended:

- Puppeteer

Sections:

- Person Details
- Revocation Clause
- Assets
- Beneficiaries
- Executor
- Guardian
- Witnesses
- Signature Block

---

# Phase 7 - Frontend

Left Panel:

- Chat UI

Right Panel:

- Live Will Preview

Additional Components:

- Completion Progress
- Validation Warnings
- Download PDF Button

---

# Phase 8 - APIs

```text
POST   /auth/register
POST   /auth/login

GET    /wills/:id

POST   /chat/message

GET    /wills/:id/preview

GET    /wills/:id/validation

GET    /wills/:id/pdf
```

---

# DECISIONS.md Topics

1. Snapshot memory vs full chat history
2. GPT-4o-mini vs GPT-4
3. Rule engine vs AI validation
4. Normalized database design
5. HTML to PDF generation

---

# INCIDENT.md Topics

Problem:

- AI forgets previous answers
- Response time becomes 12 seconds

Possible Causes:

1. Entire chat history sent each request
2. Token explosion
3. Database latency
4. Missing cache
5. OpenAI rate limiting

Mitigation:

- Snapshot memory
- Prompt reduction
- Index optimization
- Monitoring and tracing

---

# Folder Structure

```text
apps/
├── frontend-nextjs
├── backend-nestjs

packages/
├── shared-types

database/
├── migrations
├── seeds

docs/
├── DECISIONS.md
├── INCIDENT.md
```
