# Lawyered Will Maker - Complete Phase-Wise TODO Task List

**Project**: AI-Assisted Will Maker using Next.js, NestJS, PostgreSQL, OpenAI GPT-4o-mini, Docker
**Status**: Phase 0 Complete ✅ | Phase 1 Complete ✅ | Phase 2 Complete ✅ | Phase 3 Core Complete ✅ | Phase 4 Core Complete ✅ | Phase 5 Core Complete ✅ | Phase 6 Complete ✅ | Phase 7 Complete ✅
**Last Updated**: 2026-06-06

---

## PHASE 0 - Project Setup & Infrastructure

### Objectives
- Establish clean monorepo structure
- Set up development standards
- Prepare deployment environment
- Create foundation for other phases

### Tasks

#### 0.1 - Repository & Project Structure
- [x] Create GitHub repository
- [x] Initialize monorepo structure (apps/backend, apps/frontend)
- [x] Create .gitignore
- [x] Document project architecture
- [x] Set up commit conventions

#### 0.2 - Backend Setup (NestJS)
- [x] Initialize NestJS application
- [x] Configure TypeScript
- [x] Set up module structure
- [x] Install core dependencies
- [x] Create app.module.ts

#### 0.3 - Frontend Setup (Next.js)
- [x] Initialize Next.js application
- [x] Configure TypeScript
- [x] Set up pages structure
- [x] Install core dependencies
- [x] Configure API route prefix

#### 0.4 - Database Setup (PostgreSQL)
- [x] Create PostgreSQL docker container configuration
- [x] Initialize TypeORM configuration
- [x] Create migrations structure
- [x] Set up database connection pooling

#### 0.5 - Docker & Deployment
- [x] Create Dockerfile for NestJS backend
- [x] Create Dockerfile for Next.js frontend
- [x] Create docker-compose.yml
- [x] Configure environment variables for docker
- [x] Test one-command startup: `docker-compose up`

#### 0.6 - Code Quality & Standards
- [x] Install and configure ESLint
- [x] Install and configure Prettier
- [x] Set up husky pre-commit hooks
- [x] Create .editorconfig
- [x] Create .env.example with all required variables

### Deliverable
âœ… Application boots successfully with `docker-compose up`
âœ… All services communicate (frontend â†’ backend â†’ database)

---

## PHASE 1 - Authentication & User Management

### Objectives
- Enable user registration and login
- Implement JWT authentication
- Protect routes and endpoints
- Allow users to return to incomplete wills

### Tasks

#### 1.1 - User Entity & Database
- [x] Create User entity with fields: id, email, password, created_at, updated_at
- [x] Create user migration
- [x] Add indexes on email (unique)
- [x] Seed test users for development

#### 1.2 - Registration API
- [x] Create POST /auth/register endpoint
- [x] Implement email validation
- [x] Implement password strength validation (min 8 chars, mixed case, numbers)
- [x] Hash passwords using bcrypt
- [x] Return JWT token on successful registration
- [x] Handle duplicate email errors

#### 1.3 - Login API
- [x] Create POST /auth/login endpoint
- [x] Implement email/password verification
- [x] Generate JWT token with 24h expiration
- [x] Return user data with token
- [x] Handle invalid credentials gracefully

#### 1.4 - JWT Configuration
- [x] Install @nestjs/jwt and @nestjs/passport
- [x] Create JWT strategy
- [x] Configure JWT constants (secret, expiration)
- [x] Create @UseGuards(JwtAuthGuard) decorator
- [x] Create @CurrentUser() parameter decorator

#### 1.5 - Protected Routes
- [x] Create AuthGuard middleware
- [x] Apply guards to protected endpoints
- [x] Create /auth/me endpoint (get current user)
- [x] Implement logout logic (token blacklist or client-side)
- [x] Test protected route access

#### 1.6 - Frontend Auth Implementation
- [x] Create Login page
- [x] Create Register page
- [x] Implement token storage (localStorage with encryption)
- [x] Create auth context/state management
- [x] Implement protected route wrapper
- [x] Add logout functionality

### Deliverable
âœ… User can register with email and password
âœ… User can login and receive JWT token
âœ… Protected endpoints reject unauthenticated requests
âœ… User can access GET /auth/me and see their profile

---

## PHASE 2 - Database Design & Schema

### Objectives
- Create complete schema for storing wills
- Design relationships for complex data structures
- Enable partial and complete will storage
- Set up indexes for performance

### Tasks

#### 2.1 - Core Will Tables
- [x] Create `wills` table (id, user_id, title, status, created_at, updated_at)
- [x] Create `users` table (id, email, password, created_at, updated_at)
- [x] Create migration for core tables
- [x] Add foreign key constraints
- [x] Add indexes on user_id, created_at

#### 2.2 - Testator Information
- [x] Create `testators` table (id, will_id, name, age, address, sound_mind, dob)
- [x] Create migration
- [x] Add relationship: Will â†’ Testator (1:1)

#### 2.3 - Assets Management
- [x] Create `assets` table (id, will_id, name, description, location, value, type)
- [x] Create migration
- [x] Add relationship: Will â†’ Asset (1:many)
- [x] Add index on will_id

#### 2.4 - Beneficiaries & Allocations
- [x] Create `beneficiaries` table (id, will_id, name, relationship, age, contact)
- [x] Create `asset_allocations` table (id, asset_id, beneficiary_id, percentage)
- [x] Create migrations
- [x] Add constraint: percentage sum per asset = 100%
- [x] Add relationships: Asset â†’ Beneficiary (many:many through allocation)

#### 2.5 - Executors, Guardians & Witnesses
- [x] Create `executors` table (id, will_id, name, contact, primary_backup)
- [x] Create `guardians` table (id, will_id, name, relationship, contact, for_minors)
- [x] Create `witnesses` table (id, will_id, name, age, contact, signature_date)
- [x] Create migrations
- [x] Add relationships: Will â†’ Executor, Guardian, Witness (1:many)

#### 2.6 - Conversation & Snapshots
- [x] Create `chat_messages` table (id, will_id, role, content, created_at)
- [x] Create `will_snapshots` table (id, will_id, snapshot_data (JSON), created_at, updated_at)
- [x] Create migrations
- [x] Add index on will_id for quick lookups

#### 2.7 - Indexes & Constraints
- [x] Add composite index: (user_id, created_at) on wills
- [x] Add check constraint: asset allocation percentage = 100%
- [x] Add check constraint: age > 0
- [x] Add unique index: user_id + will_id if needed
- [x] Performance test on 10,000 records

#### 2.8 - Seed Data
- [x] Create seed file with test user
- [x] Create seed with sample will (partial)
- [x] Create seed with complete sample will
- [x] Create seed with edge cases (multiple beneficiaries, multiple assets)

### Deliverable
âœ… Database schema complete and documented
âœ… All migrations run successfully
âœ… Seed data loads without errors
âœ… ER diagram matches implementation

---

## PHASE 3 - AI Extraction Engine (Core)

### Objectives
- Convert natural language to structured data
- Extract facts reliably using GPT-4o-mini
- Handle structured JSON responses
- Store extracted information

### Tasks

#### 3.1 - OpenAI Integration
- [x] Install openai package
- [x] Set up API key management (.env)
- [x] Configure structured outputs mode
- [x] Implement error handling and retry logic

#### 3.2 - Extraction Prompt Design
- [x] Design system prompt for will extraction
- [x] Define extraction rules and constraints
- [x] Create prompt templates
- [x] Test prompt with sample inputs
- [x] Document prompt versioning strategy

#### 3.3 - AI Service Implementation
- [x] Create `AiService` with method: `extractFromMessage(snapshot, message)`
- [x] Implement request builder (system prompt + snapshot + message)
- [x] Parse OpenAI structured output
- [x] Add logging and monitoring
- [x] Implement token counting for cost tracking

#### 3.4 - Structured JSON Response Contract
- [x] Define response schema:
  ```json
  {
    "updates": {},
    "missingFields": [],
    "ambiguities": [],
    "nextQuestion": "",
    "confidence": 0.95
  }
  ```
- [x] Validate response against schema
- [x] Handle schema mismatches
- [x] Document response contract

#### 3.5 - Chat Message Endpoint
- [x] Create POST /wills/:willId/chat endpoint
- [x] Implement request validation
- [x] Call AiService for extraction
- [x] Store chat message in database
- [x] Return AI response to frontend
- [x] Add authentication guard

#### 3.6 - Testing & Validation
- [x] Unit test: simple asset extraction
- [x] Unit test: multiple beneficiary extraction
- [x] Unit test: ambiguity detection
- [x] Integration test: full chat flow
- [x] Cost tracking: estimate per message

### Deliverable
âœ… User sends "My house goes to my son" â†’ AI extracts Asset + Beneficiary
âœ… API returns structured JSON with confidence score
âœ… Message stored in database for history

---

## PHASE 4 - Conversation Memory & Snapshot Strategy

### Objectives
- Prevent AI from forgetting previous answers
- Keep token costs low
- Enable multi-turn conversations
- Store canonical will state

### Tasks

#### 4.1 - Will Snapshot Definition
- [x] Create TypeScript interface for WillSnapshot
- [x] Define snapshot structure:
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
    "allocations": [],
    "executor": null,
    "guardians": [],
    "witnesses": []
  }
  ```
- [x] Document snapshot fields
- [ ] Create snapshot validation schema

#### 4.2 - Snapshot Lifecycle
- [x] Create `SnapshotService`
- [x] Implement: `createInitialSnapshot(willId)`
- [x] Implement: `getLatestSnapshot(willId)`
- [x] Implement: `updateSnapshot(willId, updates)`
- [x] Implement: `persistSnapshot(willId, snapshot)`

#### 4.3 - Snapshot Persistence
- [x] Store snapshot in will_snapshots table after each message
- [ ] Create migration for snapshot versioning
- [x] Implement snapshot history retrieval
- [x] Add timestamp tracking

#### 4.4 - Memory-Aware AI Calls
- [x] Modify AiService to receive only: snapshot + latest message
- [x] Remove full chat history from AI requests
- [x] Update prompt to reference snapshot data
- [ ] Test with 10-message conversation
- [ ] Verify token usage reduction

#### 4.5 - Update Application Logic
- [x] Create `UpdateApplier` service
- [x] Parse AI updates and apply to snapshot
- [x] Handle partial updates (only changed fields)
- [ ] Validate updates against snapshot schema
- [ ] Test merge logic with various scenarios

#### 4.6 - Cost Analysis
- [ ] Calculate tokens per message with snapshot approach
- [ ] Compare vs. full history approach
- [ ] Log token usage per request
- [ ] Create cost dashboard UI

### Deliverable
âœ… Conversation persists across 20+ messages without token explosion
âœ… AI remembers all previously collected information
âœ… Token usage remains predictable and low
âœ… Snapshot can be loaded to resume interrupted will

---

## PHASE 5 - Validation Engine

### Objectives
- Determine if a will is legally complete
- Prevent AI from validating legality (deterministic rules instead)
- Provide clear feedback on missing requirements
- Support warnings vs. errors

### Tasks

#### 5.1 - Validation Rules Definition
- [x] Define rule: Executor exists and has name + contact
- [x] Define rule: At least 2 witnesses exist with dates
- [x] Define rule: Testator name, age, address provided
- [x] Define rule: Asset allocations = 100% per asset
- [x] Define rule: At least 1 asset exists
- [x] Define rule: Guardian exists if testator has minors

#### 5.2 - Rule Engine Implementation
- [x] Create `ValidationService`
- [x] Implement rule checker methods (one per rule)
- [x] Return structured validation result:
  ```json
  {
    "status": "INCOMPLETE",
    "errors": [],
    "warnings": [],
    "completeness": 65
  }
  ```

#### 5.3 - Validation Endpoint
- [x] Create GET /wills/:willId/validation
- [x] Call ValidationService
- [x] Return current state: COMPLETE | INCOMPLETE | INVALID | VALID_WITH_WARNINGS
- [x] Add authentication guard

#### 5.4 - Missing Fields Detection
- [x] Track all required fields
- [x] Return list of missing fields in response
- [x] Calculate completion percentage
- [x] Prioritize missing critical fields

#### 5.5 - Error vs. Warning Classification
- [x] Critical errors: executor, witnesses missing
- [x] Warnings: allocation recommendations, asset valuation
- [x] Document classification criteria
- [x] Test edge cases

#### 5.6 - Frontend Integration
- [x] Display validation status in UI
- [x] Show missing fields list
- [x] Show progress bar (completion %)
- [x] Highlight critical errors
- [x] Display warnings in non-blocking way

### Deliverable
âœ… Validation endpoint returns: 60% complete, needs: executor, 1 witness, beneficiary contacts
âœ… Impossible to proceed without minimum required fields
âœ… Clear visual feedback in frontend

---

## PHASE 6 - AI Extraction Engine (Advanced)

### Objectives
- Handle ambiguities gracefully
- Detect when information is unclear
- Suggest follow-up questions
- Support corrections and changes

### Tasks

#### 6.1 - Ambiguity Detection
- [x] Update AI prompt to detect ambiguities
- [x] Example: "My son gets everything" â†’ which son?
- [x] Modify response schema to include `ambiguities` array
- [x] Return list of detected ambiguities

#### 6.2 - Confidence Scoring
- [x] Update AI response to include confidence (0-1)
- [x] Flag low-confidence extractions
- [x] Request clarification for confidence < 0.7
- [x] Log confidence scores for analysis

#### 6.3 - Next Question Generation
- [x] Update AI to generate contextual next question
- [x] Prioritize: ambiguities > missing critical info > optional fields
- [x] Prevent repeated questions
- [x] Store asked questions to avoid loops

#### 6.4 - Change of Mind Handling
- [x] Update AI response schema to support replacements
- [x] Example: "Actually make Amit the executor"
- [x] Implement replace logic in UpdateApplier
- [x] Update snapshot accordingly
- [ ] Test change scenarios (executor, beneficiary, asset)

#### 6.5 - Clarification Requests
- [x] Create POST /wills/:willId/clarify endpoint
- [x] Send clarification response
- [x] Re-extract with updated understanding
- [x] Update snapshot
- [x] Reduce ambiguities list

#### 6.6 - Testing Complex Scenarios
- [x] Test: "Split my assets between X and Y"
- [x] Test: "My children inherit equally" (with multiple children)
- [x] Test: "Make my wife executor, but if she refuses, my brother"
- [x] Test: Contradictory statements handling

### Deliverable
âœ… AI detects and flags ambiguities
âœ… AI suggests clarification questions
âœ… User can correct information
âœ… Snapshot updates with corrections

---

## PHASE 7 - Live Will Builder UI

### Objectives
- Provide real-time visibility of will generation
- Show progress and validation status
- Create intuitive two-panel interface
- Enable interactive will building

### Tasks

#### 7.1 - Layout & Components
- [x] Create two-panel layout (Chat | Will Preview)
- [x] Build ChatPanel component
- [x] Build WillPreview component
- [x] Create responsive design (mobile-friendly)
- [x] Add dark/light theme support


#### 7.2 - Chat Panel
- [x] Implement message display
- [x] Create message input with send button
- [x] Show typing indicator
- [x] Display error messages
- [x] Add timestamp to messages
- [x] Implement auto-scroll to latest message

#### 7.3 - Will Preview Panel
- [x] Create TestatorInfo section display
- [x] Create Assets section display
- [x] Create Beneficiaries section display
- [x] Create Executors section display
- [x] Create Witnesses section display
- [x] Create Guardian section display
- [x] Format as mini will document

#### 7.4 - Progress Tracking
- [x] Display completion percentage
- [x] Show progress bar
- [x] Highlight missing critical sections
- [x] Display validation status badge
- [x] Show field-by-field status

#### 7.5 - Warnings & Validation Display
- [x] Show validation errors prominently
- [x] Display warnings in yellow/orange
- [x] Create collapsible details section
- [x] Suggest next steps based on validation

#### 7.6 - State Management
- [x] Integrate React Query for server state
- [x] Create custom hooks: useWill, useChat, useValidation
- [x] Implement optimistic updates
- [x] Handle loading/error states
- [x] Implement refetch strategies

#### 7.7 - Styling with Tailwind CSS
- [x] Set up Tailwind configuration
- [x] Create consistent color scheme
- [x] Build reusable component library
- [x] Ensure accessibility (ARIA labels, keyboard nav)
- [x] Test on multiple screen sizes

#### 7.8 - Interactive Features
- [x] Add edit button to sections
- [x] Implement inline editing
- [x] Create edit confirmation modal
- [x] Add undo/redo functionality
- [x] Implement local draft saving

### Deliverable
âœ… Two-panel interface with chat and live will preview
âœ… Real-time updates as user enters information
âœ… Clear progress tracking and validation feedback
âœ… Responsive and accessible UI

---

## PHASE 8 - PDF Generation & Export

### Objectives
- Generate final legal-format PDF
- Include all required sections
- Add signature areas for witnesses
- Enable download functionality

### Tasks

#### 8.1 - PDF Template Design
- [ ] Create HTML template for will
- [ ] Include testator information
- [ ] Include asset allocation details
- [ ] Include executor appointment
- [ ] Include guardian appointment
- [ ] Include witness declaration section
- [ ] Add signature lines and dates

#### 8.2 - Puppeteer Setup
- [ ] Install puppeteer package
- [ ] Create PdfService
- [ ] Implement: `generateWillPdf(willId)`
- [ ] Configure page margins and formatting
- [ ] Test PDF output quality

#### 8.3 - PDF Generation Endpoint
- [ ] Create GET /wills/:willId/pdf endpoint
- [ ] Fetch will data from database
- [ ] Generate PDF using template + data
- [ ] Return PDF file with proper headers
- [ ] Add filename from will title

#### 8.4 - Template Customization
- [ ] Support multiple will formats (Standard, Detailed, Simplified)
- [ ] Create template variants
- [ ] Add company branding/logo
- [ ] Customize fonts and styling
- [ ] Add page numbers and headers/footers

#### 8.5 - Signature Section
- [ ] Add testator signature line and date
- [ ] Add witness signature lines (2+)
- [ ] Include print instructions
- [ ] Add witness affidavit text
- [ ] Reference will validity requirements

#### 8.6 - Asset Allocation Details
- [ ] List all assets with descriptions
- [ ] Show allocation percentages
- [ ] Calculate monetary values if provided
- [ ] Group by beneficiary
- [ ] Format as clear tables

#### 8.7 - Frontend Integration
- [ ] Create "Download PDF" button
- [ ] Show loading state during generation
- [ ] Handle generation errors
- [ ] Add print-friendly view
- [ ] Implement preview before download

#### 8.8 - Testing & Quality
- [ ] Generate PDFs with various will configurations
- [ ] Verify formatting and legibility
- [ ] Test on different browsers
- [ ] Verify file size is reasonable
- [ ] Test download functionality

### Deliverable
âœ… User can download complete will as PDF
âœ… PDF includes all required legal sections
âœ… Professional formatting and layout
âœ… Ready for printing and signing

---

## PHASE 9 - Demo Data & Testing Setup

### Objectives
- Enable quick reviewer testing
- Provide realistic sample data
- Demonstrate full application flow
- Reduce setup friction

### Tasks

#### 9.1 - Demo User Account
- [ ] Create demo user: demo@lawyered.com
- [ ] Set password: secure temporary password
- [ ] Document in README
- [ ] Seed in development database
- [ ] Add to .env.example

#### 9.2 - Partial Will (In-Progress)
- [ ] Create incomplete will (30% complete)
- [ ] Include testator info only
- [ ] Missing: assets, beneficiaries, executor, witnesses
- [ ] Show AI asking for next information
- [ ] Demonstrate snapshot state

#### 9.3 - Completed Will (Final)
- [ ] Create complete will (100% complete)
- [ ] Include all required sections
- [ ] Multiple assets and beneficiaries
- [ ] Proper executor and witnesses
- [ ] Show PDF generation capability

#### 9.4 - Edge Case Examples
- [ ] Will with ambiguities (to show handling)
- [ ] Will with multiple beneficiaries
- [ ] Will with complex asset allocation
- [ ] Will with guardianship (minor beneficiaries)
- [ ] Will with multiple executions (backup executors)

#### 9.5 - Seed Script
- [ ] Create seed.ts file
- [ ] Implement database reset option
- [ ] Populate demo data
- [ ] Create test message history
- [ ] Generate snapshots

#### 9.6 - Documentation
- [ ] Create DEMO.md guide
- [ ] List demo user credentials
- [ ] Document sample scenarios
- [ ] Provide testing checklist
- [ ] Add troubleshooting section

#### 9.7 - Quick Start Guide
- [ ] Document: docker-compose up
- [ ] Document: navigate to http://localhost:3000
- [ ] Document: login with demo@lawyered.com
- [ ] Document: test features in order
- [ ] Add video walkthrough (optional)

#### 9.8 - Testing Checklist
- [ ] Test user registration
- [ ] Test user login with demo account
- [ ] Test chat with existing will
- [ ] Test validation endpoint
- [ ] Test PDF download
- [ ] Test navigation and UI
- [ ] Test on mobile
- [ ] Test error handling

### Deliverable
âœ… Reviewer can login immediately (demo@lawyered.com)
âœ… Sample wills demonstrate all features
âœ… PDF generation works with sample data
âœ… Full user journey visible in 5 minutes

---

## PHASE 10 - Cost Optimization & Production Readiness

### Objectives
- Ensure low operational costs
- Optimize for production deployment
- Implement monitoring and analytics
- Document architecture decisions

### Tasks

#### 10.1 - Token Usage Optimization
- [ ] Implement token counting for all API calls
- [ ] Log token usage per message
- [ ] Create cost dashboard
- [ ] Analyze: typical will = X tokens
- [ ] Set cost alerts

#### 10.2 - Model Selection Confirmation
- [ ] Verify GPT-4o-mini is optimal choice
- [ ] Compare with GPT-4 turbo (cost vs. quality)
- [ ] Test edge cases with chosen model
- [ ] Benchmark extraction accuracy
- [ ] Document model rationale

#### 10.3 - Caching Strategy
- [ ] Implement response caching for prompts
- [ ] Cache common extraction patterns
- [ ] Set cache expiration policies
- [ ] Measure cache hit rates
- [ ] Calculate cost savings

#### 10.4 - Database Optimization
- [ ] Verify all indexes are in place
- [ ] Run EXPLAIN ANALYZE on common queries
- [ ] Optimize slow queries
- [ ] Implement connection pooling
- [ ] Set up query monitoring

#### 10.5 - Error Handling & Resilience
- [ ] Implement exponential backoff for AI calls
- [ ] Add circuit breaker for external APIs
- [ ] Handle database connection failures
- [ ] Implement graceful degradation
- [ ] Log all errors systematically

#### 10.6 - Monitoring & Logging
- [ ] Set up structured logging (Winston/Pino)
- [ ] Create log levels (debug, info, warn, error)
- [ ] Implement centralized log aggregation
- [ ] Create dashboards for key metrics
- [ ] Set up alerts for critical errors

#### 10.7 - Security Hardening
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Implement HTTPS enforcement
- [ ] Add input validation and sanitization
- [ ] Review and fix security vulnerabilities

#### 10.8 - Deployment Configuration
- [ ] Create production Dockerfile
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Implement database migrations in deployment
- [ ] Create rollback procedures

#### 10.9 - Documentation
- [ ] Create Architecture.md
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Document cost analysis
- [ ] Create troubleshooting guide

#### 10.10 - Final Testing
- [ ] Load test: 100 concurrent users
- [ ] Stress test: rapid message sending
- [ ] Test failover scenarios
- [ ] Verify cost estimates
- [ ] Security audit

### Deliverable
âœ… Production-ready application
âœ… Cost predictable and documented
âœ… Monitoring and alerting in place
âœ… Deployment automated and repeatable

---

## Timeline & Dependencies

### Critical Path
```
Phase 0 (Setup)
    â†“
Phase 1 (Auth) + Phase 2 (Database) [parallel]
    â†“
Phase 3 (AI Core)
    â†“
Phase 4 (Memory) + Phase 5 (Validation) [parallel]
    â†“
Phase 6 (Advanced AI)
    â†“
Phase 7 (UI)
    â†“
Phase 8 (PDF)
    â†“
Phase 9 (Demo Data)
    â†“
Phase 10 (Production)
```

### Estimated Effort
- **Phase 0**: 2-3 days
- **Phase 1-2**: 3-4 days (parallel)
- **Phase 3**: 3-4 days
- **Phase 4-5**: 2-3 days (parallel)
- **Phase 6**: 2-3 days
- **Phase 7**: 4-5 days
- **Phase 8**: 2-3 days
- **Phase 9**: 1-2 days
- **Phase 10**: 2-3 days

**Total**: ~28-35 days

---

## Key Architecture Principles

âœ… **Memory Efficiency**: Send snapshot + latest message only (NOT full history)
âœ… **Cost Conscious**: Use GPT-4o-mini, track tokens, optimize prompts
âœ… **Rule-Based Validation**: Never trust AI for legality checks
âœ… **Deterministic Extraction**: Structured outputs, schema validation
âœ… **User-Centric**: Save progress, handle corrections, clear feedback
âœ… **Production Ready**: Monitoring, error handling, security, scalability

---

## Success Criteria

- [ ] All 10 phases completed
- [ ] User can create, save, and download complete will
- [ ] AI accurately extracts and disambiguates information
- [ ] System remains low-cost even with scale
- [ ] Reviewers can immediately test with demo data
- [ ] Code is production-ready and well-documented

