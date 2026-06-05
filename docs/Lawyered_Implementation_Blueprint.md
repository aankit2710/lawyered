# Lawyered Will Maker - Implementation Blueprint

# 1. High Level Architecture

```text
Next.js (Frontend)
      |
      v
NestJS API
      |
      +-----------------------+
      |                       |
      v                       v
 PostgreSQL            OpenAI GPT-4o-mini
      |
      v
 Will Snapshot Store
```

Principle:

- AI extracts facts
- Database stores truth
- Validation service enforces rules
- PDF service generates documents

---

# 2. ER Diagram

```text
USERS
 |
 | 1:N
 |
WILLS
 |
 +-------------------------------+
 |            |          |        |
 |            |          |        |
 v            v          v        v

ASSETS   BENEFICIARIES EXECUTOR WITNESSES
   |
   |
   v
ASSET_ALLOCATIONS

GUARDIANS
```

---

# 3. Database Schema

## users

```sql
id UUID PK
email VARCHAR UNIQUE
password_hash VARCHAR
created_at TIMESTAMP
updated_at TIMESTAMP
```

## wills

```sql
id UUID PK
user_id UUID FK

status VARCHAR

testator_name VARCHAR
testator_age INT
testator_address TEXT

sound_mind BOOLEAN

revocation_clause TEXT

completion_percentage INT

created_at TIMESTAMP
updated_at TIMESTAMP
```

## beneficiaries

```sql
id UUID PK
will_id UUID FK

name VARCHAR
relationship VARCHAR
age INT
```

## assets

```sql
id UUID PK
will_id UUID FK

asset_type VARCHAR
asset_name VARCHAR

estimated_value NUMERIC

metadata JSONB
```

## asset_allocations

```sql
id UUID PK

asset_id UUID FK
beneficiary_id UUID FK

percentage NUMERIC
```

## executors

```sql
id UUID PK

will_id UUID FK

name VARCHAR
relationship VARCHAR
contact_number VARCHAR
```

## guardians

```sql
id UUID PK

will_id UUID FK

name VARCHAR
relationship VARCHAR
```

## witnesses

```sql
id UUID PK

will_id UUID FK

name VARCHAR
address TEXT
```

## chat_messages

```sql
id UUID PK

will_id UUID FK

role VARCHAR

message TEXT

created_at TIMESTAMP
```

## will_snapshots

```sql
id UUID PK

will_id UUID FK

snapshot JSONB

created_at TIMESTAMP
```

---

# 4. NestJS Folder Structure

```text
src/

auth/
users/

wills/
assets/
beneficiaries/
executors/
guardians/
witnesses/

chat/
ai/

validation/

pdf/

database/

common/
```

---

# 5. AI Contract

Input

```json
{
  "currentSnapshot": {},
  "latestMessage": ""
}
```

Output

```json
{
  "updates": {},
  "missingFields": [],
  "nextQuestion": "",
  "confidence": 0.95
}
```

---

# 6. Prompt

System Prompt

You are a Will Information Extractor.

Rules:

1. Return JSON only.
2. Never invent values.
3. Extract assets.
4. Extract beneficiaries.
5. Extract executor.
6. Extract guardian.
7. Extract witnesses.
8. Detect missing information.
9. Suggest exactly one next question.

---

# 7. Validation Engine

ValidationResult

```ts
{
  status:
    | "INCOMPLETE"
    | "INVALID"
    | "VALID_WITH_WARNINGS"
    | "COMPLETE";

  errors: [];
  warnings: [];
}
```

Rules

Mandatory:

- Executor exists
- Two witnesses exist
- Asset allocation = 100%
- Guardian exists if child < 18

Warning:

- Witness is beneficiary

---

# 8. Chat Flow

```text
User Message
      |
      v
Save Message
      |
      v
Load Snapshot
      |
      v
Call AI Extractor
      |
      v
Update Snapshot
      |
      v
Save Entities
      |
      v
Run Validation
      |
      v
Return Next Question
```

---

# 9. API Design

Authentication

POST /auth/register
POST /auth/login

Will

POST /wills
GET /wills/:id
GET /wills/:id/preview

Chat

POST /chat/message

Validation

GET /wills/:id/validation

PDF

GET /wills/:id/pdf

---

# 10. Frontend Pages

/login

/register

/dashboard

/wills/[id]

Layout

```text
+-------------------------------------+
| Progress Bar                        |
+------------------+------------------+
|                  |                  |
| Chat             | Live Preview     |
|                  |                  |
+------------------+------------------+
| Warnings                            |
+-------------------------------------+
```

---

# 11. Seed Data

Demo User

demo@lawyered.com

Password@123

Completed Sample Will

- House
- Wife
- Two Witnesses
- Executor
- Generated PDF

---

# 12. DECISIONS.md

1. Why GPT-4o-mini
2. Why snapshot memory
3. Why validation outside AI
4. Why normalized schema
5. Why HTML -> PDF

---

# 13. INCIDENT.md

Issue

Users report:

- AI forgets context
- Response time 12 seconds

Investigation

1. Check API latency
2. Check DB latency
3. Check OpenAI latency
4. Check token count
5. Check prompt size

Likely Cause

Entire conversation sent every request.

Fix

Store structured snapshot.
Send snapshot + latest message only.

Expected Result

Latency reduced.
Cost reduced.
Context retained.

---

# 14. 6-Hour Execution Plan

Hour 1
- Auth
- DB schema

Hour 2
- Entities
- Migrations
- Seed data

Hour 3
- AI extraction endpoint

Hour 4
- Validation engine

Hour 5
- Frontend chat + preview

Hour 6
- PDF
- README
- DECISIONS.md
- INCIDENT.md
