# Lawyered Will Maker - Phase-wise TODO Plan

# Goal

Build an AI-assisted Will Maker using:

- Next.js
- NestJS
- PostgreSQL
- OpenAI GPT-4o-mini
- Docker

The objective is not just to complete the assignment but to demonstrate strong architectural thinking, production readiness, and cost-conscious AI usage.

---

# Phase 0 - Project Setup

## Purpose

Create a clean monorepo structure and establish development standards before writing business logic.

## Tasks

- Create repository
- Setup NestJS application
- Setup Next.js application
- Configure PostgreSQL
- Configure Docker Compose
- Setup ESLint and Prettier
- Create .env.example

## Technology

### NestJS

Why:

- Required by assignment
- Enterprise-grade structure
- Dependency injection
- Easy module separation

### Next.js

Why:

- Required by assignment
- Fast development
- Excellent routing
- Easy API integration

### PostgreSQL

Why:

- Required by assignment
- Relational data model fits wills naturally
- Strong data integrity

### Docker Compose

Why:

- One-command setup
- Reviewer can run quickly
- Production-friendly

Deliverable:

- Application boots successfully

---

# Phase 1 - Authentication

## Purpose

Allow users to register and return later to continue unfinished wills.

## Tasks

- Register API
- Login API
- JWT authentication
- Password hashing
- Protected routes

## Technology

### JWT

Why:

- Stateless authentication
- Simple and scalable

### bcrypt

Why:

- Industry standard password hashing

Tables

- users

Deliverable

User can:

- Register
- Login
- Access protected endpoints

---

# Phase 2 - Database Design

## Purpose

Create a schema capable of storing a complete or partially completed will.

## Tasks

Create tables:

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

Create indexes

Create seed data

## Technology

### PostgreSQL

Why:

Relationships matter:

- Asset → Beneficiary
- Will → Witnesses
- Will → Executor

Relational modeling is ideal.

Deliverable

Database migration and seed script.

---

# Phase 3 - AI Extraction Engine

## Purpose

Convert natural language into structured data.

Example:

"My house in Pune goes to my son Rahul."

becomes

- Asset
- Beneficiary
- Allocation

## Tasks

Create:

POST /chat/message

Implement:

- Extraction prompt
- Structured JSON response
- Snapshot update

## Technology

### GPT-4o-mini

Why:

- Very low cost
- Reliable structured output
- Faster than larger models

### OpenAI Structured Outputs

Why:

- JSON schema validation
- Avoid parsing text responses

Deliverable

AI extracts information reliably.

---

# Phase 4 - Conversation Memory

## Purpose

Prevent AI from forgetting previous answers while keeping costs low.

## Tasks

Create:

will_snapshots

Store:

- Current known facts
- Missing information

Send:

Snapshot + Latest Message

NOT:

Entire Chat History

## Technology

### Snapshot Strategy

Why:

- Lower token usage
- Faster responses
- Better scalability

Deliverable

AI remembers previously collected information.

---

# Phase 5 - Validation Engine

## Purpose

Determine whether a will is legally complete.

## Tasks

Implement rules:

- Executor exists
- Two witnesses exist
- Guardian exists if required
- Asset allocation equals 100%

Implement:

- Errors
- Warnings
- Completion state

## Technology

### Rule Engine

Why:

Validation should never depend on AI.

AI can hallucinate.

Rules must be deterministic.

Deliverable

Validation endpoint returns:

- COMPLETE
- INCOMPLETE
- INVALID
- VALID_WITH_WARNINGS

---

# Phase 6 - Live Will Builder

## Purpose

Provide real-time visibility into the will being generated.

## Tasks

Build:

Left Panel:

- Chat

Right Panel:

- Live Will Preview

Show:

- Progress
- Warnings
- Completion

## Technology

### React Query

Why:

- Simple server state management
- Automatic refetching

### Tailwind CSS

Why:

- Fast UI development

Deliverable

Working two-panel interface.

---

# Phase 7 - PDF Generation

## Purpose

Generate final downloadable will.

## Tasks

Create:

GET /wills/:id/pdf

Build:

- Will template
- Signature section
- Witness section

## Technology

### HTML + Puppeteer

Why:

- Faster than PDF libraries
- Better formatting control

Deliverable

Downloadable PDF.

---

# Phase 8 - Demo Data

## Purpose

Allow reviewers to test quickly.

## Tasks

Create:

Demo User

demo@lawyered.com

Create:

Completed Will

Seed Data

Deliverable

Reviewer can immediately login and test.

---

# Phase 9 - Documentation

## Purpose

Demonstrate senior engineering thinking.

## Tasks

Create:

README.md

DECISIONS.md

INCIDENT.md

## Technology

Markdown

Why:

Simple and reviewer-friendly.

Deliverable

Complete documentation.

---

# Phase 10 - Production Hardening (If Time Remains)

## Purpose

Show Tech Lead mindset.

## Tasks

- API logging
- Request tracing
- Error handling
- Rate limiting
- Input validation
- Database indexing review

## Technology

### NestJS Validation Pipe

Why:

Prevent invalid data.

### Winston/Pino

Why:

Production logging.

Deliverable

Production-ready architecture discussion.

---

# Recommended Build Order

1. Setup
2. Auth
3. Database
4. AI Extraction
5. Snapshot Memory
6. Validation
7. Frontend
8. PDF
9. Seed Data
10. Documentation

---

# Success Criteria

A user can:

1. Register
2. Login
3. Chat naturally
4. AI extracts facts
5. System validates will
6. Preview updates live
7. Download completed PDF

This satisfies all mandatory requirements of the Lawyered assignment.
