# DECISIONS

## 1. Deterministic Flow + LLM Extraction
Alternative: Fully AI-driven conversation.
Chosen: Deterministic flow with AI extraction.
Reason: Lower cost, easier debugging, predictable behavior.

## 2. Snapshot Memory
Alternative: Send entire chat history.
Chosen: Structured snapshot + latest message.
Reason: Lower latency and token cost.

## 3. Validation Outside AI
Alternative: Ask AI if will is valid.
Chosen: Rule engine.
Reason: Deterministic and auditable.

## 4. Normalized Database
Alternative: Single JSON document.
Chosen: Relational model.
Reason: Better querying and data integrity.

## 5. HTML to PDF
Alternative: Direct PDF library.
Chosen: HTML + Puppeteer.
Reason: Faster development and easier formatting.