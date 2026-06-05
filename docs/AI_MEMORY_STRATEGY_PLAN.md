# AI Extraction + Memory Strategy Deep Dive

# Why This Matters

According to the assignment, the AI Interview is the highest scoring section.

The reviewers specifically want to evaluate:

- Fact extraction
- Conversation memory
- Ambiguous answers
- Change of mind handling
- Cost optimization

This document focuses only on those concerns.

---

# Phase A - Define the Canonical Will State

## Purpose

Create a single source of truth for everything known about a will.

Never trust chat history.

Always trust structured data.

## Will Snapshot

```json
{
  "testator": {
    "name": null,
    "age": null,
    "address": null,
    "soundMind": true
  },
  "assets": [],
  "beneficiaries": [],
  "executor": null,
  "guardian": null,
  "witnesses": []
}
```

This snapshot is stored after every successful message.

---

# Phase B - Design the AI Contract

## Purpose

Force the LLM to behave like an extraction engine.

Not a chatbot.

## Input

```json
{
  "currentSnapshot": {},
  "latestMessage": ""
}
```

## Output

```json
{
  "updates": {},
  "missingFields": [],
  "ambiguities": [],
  "nextQuestion": "",
  "confidence": 0.95
}
```

---

# Phase C - Structured Extraction

## Purpose

Convert free text into database-friendly objects.

## Example

User:

"My house in Pune should go equally to Rahul and Rohit."

AI Output

```json
{
  "assets": [
    {
      "name": "House",
      "location": "Pune"
    }
  ],
  "allocations": [
    {
      "beneficiary": "Rahul",
      "percentage": 50
    },
    {
      "beneficiary": "Rohit",
      "percentage": 50
    }
  ]
}
```

---

# Phase D - Missing Information Detection

## Purpose

Determine what is still needed.

## Example

Current State

```text
Name ✓
Age ✓
Address ✓
Executor ✗
Witnesses ✗
```

AI Returns

```json
{
  "missingFields": [
    "executor",
    "witnesses"
  ]
}
```

---

# Phase E - Ambiguity Handling

## Purpose

Prevent incorrect assumptions.

Never guess.

## Example 1

User:

"My son gets everything."

Problem:

Which son?

AI Returns

```json
{
  "ambiguities": [
    "Multiple sons exist"
  ]
}
```

Next Question:

```text
Which son would you like to inherit the assets?
```

---

## Example 2

User

"Split between my children."

Problem

No percentages.

AI Should Ask

```text
How would you like the assets divided among your children?
```
---

# Phase F - Change of Mind Handling

## Purpose

Support updates naturally.

## Example

Old State

```json
{
  "executor": {
    "name": "Rahul"
  }
}
```

User

"Actually make Amit the executor."

AI Output

```json
{
  "replace": {
    "executor": {
      "name": "Amit"
    }
  }
}
```

Database is updated.

Snapshot is updated.

Old value replaced.

---

# Phase G - Memory Strategy

## Purpose

Avoid sending full chat history.

This is the most important design decision.

---

## Bad Approach

Every request:

```text
Message 1
Message 2
Message 3
Message 4
...
Message 50
```

Problems:

- Expensive
- Slow
- Token explosion
- Hard to scale

---

## Recommended Approach

Send:

```json
{
  "snapshot": {},
  "latestMessage": ""
}
```

Only.

Benefits:

- Cheap
- Fast
- Predictable

---

# Phase H - Snapshot Lifecycle

User Message

↓

AI Extraction

↓

Update Snapshot

↓

Persist Snapshot

↓

Run Validation

↓

Generate Next Question

---

# Phase I - Validation Ownership

## AI SHOULD

- Extract facts
- Detect ambiguity
- Suggest next question

## AI SHOULD NOT

- Validate legality
- Calculate completion
- Decide final status

Validation belongs to backend.

---

# Phase J - Cost Optimization

## Model

GPT-4o-mini

Reason:

- Low cost
- Fast
- Reliable JSON output

---

## Prompt Strategy

Use:

```text
System Prompt
+
Snapshot
+
Latest User Message
```

Avoid:

```text
Entire Conversation
```

---

## Expected Cost

Typical Will

20-30 messages

Using Snapshot Strategy:

Very low cost per user.

Suitable even for production.

---

# Phase K - Implementation Tasks

## Task 1

Create:

```text
AiService
```

Methods

```ts
extractFacts()
```

---

## Task 2

Create:

```text
WillSnapshotService
```

Methods

```ts
loadSnapshot()
saveSnapshot()
updateSnapshot()
```

---

## Task 3

Create:

```text
ValidationService
```

Methods

```ts
validateWill()
```

---

## Task 4

Create:

```text
ChatService
```

Flow

1. Load snapshot
2. Call AI
3. Update DB
4. Update snapshot
5. Validate
6. Return response

---

# CTO Interview Answer

If asked:

"How do you keep AI cost under control?"

Answer:

"I do not resend the entire conversation. After every interaction I maintain a structured will snapshot in PostgreSQL. For each AI call I send only the latest user message and the current snapshot. This significantly reduces token consumption, improves latency, and prevents context window growth while preserving all required information."
