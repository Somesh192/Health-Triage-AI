# Execution Plan: Multimodal Healthcare Triage Assistant

## Overview

**Project**: Multimodal Healthcare Triage Assistant for BPUT Hackathon 2026 (PS-03)
**Timeline**: 21 days
**Approach**: Parallel development (frontend + backend + AI simultaneously)
**Strategy**: Safety-first, privacy-first, offline-first

---

## Execution Strategy

### Parallel Development Approach
We'll work on multiple tracks simultaneously to maximize efficiency:

**Track A: Frontend (Next.js)**
- UI components and screens
- State management
- PWA configuration
- IndexedDB offline storage

**Track B: Backend (FastAPI)**
- API endpoints
- Database models
- Authentication (JWT + RBAC)
- Business logic

**Track C: AI/ML Integration**
- OCR pipeline (PaddleOCR)
- Speech-to-text (Bhashini)
- LLM integration (Ollama + Gemini)
- PII detection (spaCy)

**Track D: Privacy & Security**
- Consent system
- PII anonymization
- Audit logging
- Data encryption

---

## Detailed Execution Plan

### Phase 1: Foundation & Setup (Days 1-2)

#### Day 1: Project Initialization
**Morning (4 hours)**
- [x] Create execution plan document
- [ ] Create SETUP.md with installation instructions
- [ ] Create .env.example template
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install TailwindCSS and configure
- [ ] Set up shadcn/ui components
- [ ] Configure ESLint and Prettier

**Afternoon (4 hours)**
- [ ] Initialize FastAPI backend with Python
- [ ] Set up virtual environment
- [ ] Install dependencies (FastAPI, SQLAlchemy, Pydantic)
- [ ] Configure project structure
- [ ] Set up git repository
- [ ] Create .gitignore
- [ ] Verify both dev servers running

**Deliverables**:
- Working Next.js frontend (localhost:3000)
- Working FastAPI backend (localhost:8000)
- SETUP.md with installation instructions
- .env.example template

---

#### Day 2: Core Infrastructure
**Morning (4 hours)**
- [ ] Set up SQLite database with SQLAlchemy
- [ ] Create database models (User, Patient, TriageNote, Consent, AuditLog)
- [ ] Implement database migrations
- [ ] Create database initialization script
- [ ] Test database operations

**Afternoon (4 hours)**
- [ ] Implement JWT authentication
- [ ] Create user models and roles (Nurse, MO, Admin)
- [ ] Implement RBAC middleware
- [ ] Create authentication API endpoints (/auth/login, /auth/register)
- [ ] Test authentication flow
- [ ] Create API response templates

**Deliverables**:
- Database schema initialized
- Authentication system working
- RBAC middleware implemented
- Protected API endpoints

---

### Phase 2: Privacy & Consent (Day 3)

#### Day 3: Privacy Foundation
**Morning (4 hours)**
- [ ] Design consent recorder UI (interactive)
- [ ] Implement consent data model
- [ ] Create consent API endpoints
- [ ] Implement consent recording (timestamp, type, location)
- [ ] Create consent flow in frontend

**Afternoon (4 hours)**
- [ ] Install spaCy for NER
- [ ] Implement PII detection service (Aadhaar, phone, name, address)
- [ ] Create PII anonymization engine
- [ ] Implement PII redaction before cloud processing
- [ ] Set up audit logging service
- [ ] Test PII detection accuracy

**Deliverables**:
- Interactive consent screen
- PII detection and redaction working
- Audit trail logging functional
- Consent API endpoints

---

### Phase 3: Multimodal Ingestion (Days 4-7)

#### Day 4: Voice Input System
**Morning (4 hours)**
- [ ] Set up Bhashini API account and get API key
- [ ] Implement voice recording UI (Web Audio API)
- [ ] Integrate Bhashini API for speech-to-text
- [ ] Implement real-time transcription display
- [ ] Add language auto-detection (Hindi, Odia, Bengali, Telugu)
- [ ] Add confidence score indicator

**Afternoon (4 hours)**
- [ ] Implement fallback translation (Google Translation API)
- [ ] Create voice input component
- [ ] Implement text normalization (vernacular to standard)
- [ ] Add error handling for API failures
- [ ] Test voice input in Hindi and Odia
- [ ] Create local mock API for testing without keys

**Deliverables**:
- Voice input working in Hindi and Odia
- Real-time transcription display
- Confidence score indicator
- Mock API for offline testing

---

#### Day 5: Text Input & Symptom Extraction
**Morning (4 hours)**
- [ ] Create multi-language text input form
- [ ] Implement text validation and sanitization
- [ ] Add character count indicator
- [ ] Implement auto-save draft feature
- [ ] Create symptom history view

**Afternoon (4 hours)**
- [ ] Set up Ollama for local LLM
- [ ] Download Llama-3.2 3B model
- [ ] Implement symptom extraction using LLM
- [ ] Add symptom categorization (respiratory, gastrointestinal, etc.)
- [ ] Implement timeline extraction (duration, progression)
- [ ] Create missing information detector

**Deliverables**:
- Text input form with multi-language support
- Symptom extraction working
- Missing info detection functional
- Local LLM (Ollama) running

---

#### Day 6: Document OCR Pipeline
**Morning (4 hours)**
- [ ] Install PaddleOCR and dependencies
- [ ] Install Tesseract as fallback
- [ ] Implement image preprocessing (deskew, denoise)
- [ ] Create document upload API endpoint
- [ ] Implement OCR with bounding box extraction
- [ ] Add support for PDF files

**Afternoon (4 hours)**
- [ ] Create document viewer component
- [ ] Implement OCR confidence scoring
- [ ] Add retry logic for failed OCR
- [ ] Implement progress indicator
- [ ] Test OCR on sample lab reports
- [ ] Optimize OCR performance

**Deliverables**:
- Document upload working
- OCR with bounding boxes
- Document viewer with text overlay
- OCR confidence scoring

---

#### Day 7: Lab Value Extraction & Visual Grounding
**Morning (4 hours)**
- [ ] Implement lab value extraction (regex + LLM)
- [ ] Create lab value normalization (units, reference ranges)
- [ ] Implement abnormal value detection
- [ ] Create bounding box mapping (value → coordinates)
- [ ] Add support for common report types (CBC, Blood Sugar, LFT)

**Afternoon (4 hours)**
- [ ] Implement visual highlight on document viewer
- [ ] Add click-to-jump to source functionality
- [ ] Create lab results summary component
- [ ] Implement hover effects on highlights
- [ ] Test visual grounding on sample reports
- [ ] Optimize rendering performance

**Deliverables**:
- Lab value extraction from OCR
- Visual bounding box highlighting
- Lab results summary with abnormal flags
- Click-to-jump to source

---

### Phase 4: Hybrid Triage Engine (Days 8-10)

#### Day 8: Deterministic Rule Engine
**Morning (4 hours)**
- [ ] Implement ICMR PHC protocol rules
- [ ] Create critical vitals detection (SpO2 < 90%, BP > 180)
- [ ] Implement warning rules (Hb < 7.0, Platelets < 50K)
- [ ] Create rule priority system (Critical > Warning > Baseline)
- [ ] Implement rule engine API

**Afternoon (4 hours)**
- [ ] Add rule versioning and audit trail
- [ ] Create rule testing suite (100% coverage)
- [ ] Document all clinical rules
- [ ] Test rule engine with sample data
- [ ] Validate against ICMR guidelines
- [ ] Create rule configuration file

**Deliverables**:
- Rule engine with ICMR protocols
- Critical and warning rules implemented
- Comprehensive rule tests
- Rule documentation

---

#### Day 9: LLM Integration
**Morning (4 hours)**
- [ ] Set up Gemini 1.5 Flash API key
- [ ] Implement LLM prompt templates
- [ ] Create 5-part triage note generator
- [ ] Implement prompt guardrails (no diagnostic language)
- [ ] Add disclaimer injection in all outputs

**Afternoon (4 hours)**
- [ ] Implement LLM response validation
- [ ] Create LLM fallback mechanism (rule engine only)
- [ ] Implement response caching
- [ ] Add error handling for API failures
- [ ] Test LLM with sample patient data
- [ ] Create mock LLM for testing without keys

**Deliverables**:
- LLM integration working (local + cloud)
- Triage note generation
- Guardrails and disclaimers in place
- Mock LLM for offline testing

---

#### Day 10: Hybrid Engine Integration
**Morning (4 hours)**
- [ ] Integrate rule engine with LLM
- [ ] Implement rule override logic (rules > LLM)
- [ ] Create unified triage assessment API
- [ ] Implement urgency calculation (RED/AMBER/GREEN)
- [ ] Add urgency signal aggregation

**Afternoon (4 hours)**
- [ ] Create triage note data model
- [ ] Implement triage result caching
- [ ] Add performance monitoring
- [ ] Test hybrid engine with edge cases
- [ ] Validate rule overrides
- [ ] Document hybrid engine flow

**Deliverables**:
- Complete hybrid triage engine
- Rule-based overrides working
- Triage assessment API functional
- Hybrid engine documentation

---

### Phase 5: Doctor Dashboard (Days 11-13)

#### Day 11: Queue Management
**Morning (4 hours)**
- [ ] Create color-coded queue board UI
- [ ] Implement auto-sort by urgency (RED first)
- [ ] Add wait time tracking
- [ ] Create patient card component
- [ ] Implement queue refresh (real-time)

**Afternoon (4 hours)**
- [ ] Add queue filtering (by urgency, time)
- [ ] Create bulk actions (assign, mark reviewed)
- [ ] Implement queue statistics dashboard
- [ ] Add search functionality
- [ ] Test queue with sample patients
- [ ] Optimize queue rendering

**Deliverables**:
- Color-coded queue board
- Auto-sort by urgency
- Wait time tracking
- Queue statistics

---

#### Day 12: Patient Review Interface
**Morning (4 hours)**
- [ ] Create patient detail view
- [ ] Display 5-part triage note
- [ ] Show source documents with highlights
- [ ] Implement 1-click source attestation
- [ ] Add vitals visualization (charts)

**Afternoon (4 hours)**
- [ ] Create lab results display with reference ranges
- [ ] Implement missing info highlight
- [ ] Add suggested questions for doctor
- [ ] Create action buttons (admit, refer, discharge)
- [ ] Test patient review flow
- [ ] Optimize review interface

**Deliverables**:
- Patient review interface
- 1-click source attestation
- Complete triage note display
- Action buttons functional

---

#### Day 13: Referral & Actions
**Morning (4 hours)**
- [ ] Implement ABDM referral note template
- [ ] Create PDF generation for referral notes
- [ ] Add referral note customization
- [ ] Implement doctor signature capture
- [ ] Create action buttons (admit, refer, discharge)

**Afternoon (4 hours)**
- [ ] Add patient status tracking
- [ ] Implement referral handoff logging
- [ ] Create referral history view
- [ ] Test referral generation
- [ ] Validate ABDM format
- [ ] Create referral export functionality

**Deliverables**:
- ABDM referral note generator
- PDF export working
- Action buttons functional
- Referral history

---

### Phase 6: Offline-First & PWA (Days 14-15)

#### Day 14: Offline Storage
**Morning (4 hours)**
- [ ] Install Dexie.js for IndexedDB
- [ ] Set up IndexedDB schema
- [ ] Create offline data models
- [ ] Implement patient data local storage
- [ ] Add offline queue for sync

**Afternoon (4 hours)**
- [ ] Create sync status indicator
- [ ] Implement conflict resolution strategy
- [ ] Add offline mode detection
- [ ] Create offline-first data fetching
- [ ] Test offline functionality
- [ ] Validate sync logic

**Deliverables**:
- IndexedDB storage working
- Offline queue implemented
- Sync status indicator
- Conflict resolution

---

#### Day 15: PWA Configuration
**Morning (4 hours)**
- [ ] Install next-pwa
- [ ] Configure PWA manifest
- [ ] Create service worker
- [ ] Add offline fallback pages
- [ ] Create install prompt

**Afternoon (4 hours)**
- [ ] Test PWA on mobile devices
- [ ] Optimize bundle size
- [ ] Add PWA update notifications
- [ ] Test PWA installation
- [ ] Validate offline functionality
- [ ] Create PWA documentation

**Deliverables**:
- PWA installable
- Offline functionality working
- Mobile-responsive design
- PWA documentation

---

### Phase 7: Testing & Quality Assurance (Days 16-17)

#### Day 16: Testing Suite
**Morning (4 hours)**
- [ ] Write unit tests for rule engine (100% coverage)
- [ ] Write unit tests for PII detection
- [ ] Write integration tests for API endpoints
- [ ] Write component tests for UI
- [ ] Configure test runners (pytest, Jest)

**Afternoon (4 hours)**
- [ ] Write E2E tests for critical flows
- [ ] Implement security tests (XSS, SQL injection)
- [ ] Add performance benchmarks
- [ ] Create test data fixtures
- [ ] Run full test suite
- [ ] Fix failing tests

**Deliverables**:
- Comprehensive test suite
- 80%+ code coverage
- All tests passing

---

#### Day 17: Security & Privacy Audit
**Morning (4 hours)**
- [ ] Audit PII detection accuracy
- [ ] Test consent flow end-to-end
- [ ] Verify audit trail logging
- [ ] Test RBAC enforcement
- [ ] Verify data retention policy

**Afternoon (4 hours)**
- [ ] Test encryption at rest
- [ ] Verify TLS configuration
- [ ] Run dependency vulnerability scan (Snyk)
- [ ] Fix security issues
- [ ] Create security audit report
- [ ] Document privacy controls

**Deliverables**:
- Security audit report
- Privacy compliance verified
- Vulnerabilities fixed

---

### Phase 8: Polish & Demo Preparation (Days 18-20)

#### Day 18: UI/UX Refinement
**Morning (4 hours)**
- [ ] Improve accessibility (WCAG 2.1 AA)
- [ ] Add loading states and skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Improve mobile responsiveness

**Afternoon (4 hours)**
- [ ] Add keyboard navigation
- [ ] Optimize animations
- [ ] Add progress indicators
- [ ] Test accessibility with screen reader
- [ ] Fix UI issues
- [ ] Polish visual design

**Deliverables**:
- Polished UI/UX
- Accessibility compliant
- Mobile-optimized

---

#### Day 19: Performance Optimization
**Morning (4 hours)**
- [ ] Optimize images and assets
- [ ] Implement code splitting
- [ ] Add lazy loading
- [ ] Optimize database queries
- [ ] Implement response caching

**Afternoon (4 hours)**
- [ ] Add CDN for static assets
- [ ] Optimize bundle size
- [ ] Performance test (Lighthouse)
- [ ] Fix performance issues
- [ ] Target: Lighthouse score >90
- [ ] Document optimizations

**Deliverables**:
- Lighthouse score >90
- Page load <2 seconds
- Optimized bundle size

---

#### Day 20: Demo Script & Documentation
**Morning (4 hours)**
- [ ] Create demo script with scenarios
- [ ] Prepare sample data (synthetic patients)
- [ ] Create demo walkthrough
- [ ] Test demo end-to-end
- [ ] Time demo execution

**Afternoon (4 hours)**
- [ ] Write README with setup instructions
- [ ] Document API endpoints (OpenAPI)
- [ ] Create architecture diagrams
- [ ] Write user guide
- [ ] Prepare presentation slides
- [ ] Create demo video (optional)

**Deliverables**:
- Complete demo script
- Comprehensive documentation
- Presentation ready
- Demo tested

---

### Phase 9: Final Review & Submission (Day 21)

#### Day 21: Final Checks
**Morning (4 hours)**
- [ ] Run full test suite
- [ ] Verify all critical paths
- [ ] Check safety guardrails (no diagnostic language)
- [ ] Verify privacy controls (PII, consent)
- [ ] Test offline functionality

**Afternoon (4 hours)**
- [ ] Demo dry run
- [ ] Final code review
- [ ] Prepare submission package
- [ ] Create submission checklist
- [ ] Final documentation review
- [ ] Submit project

**Deliverables**:
- Complete working prototype
- Submission package ready
- Demo tested and verified

---

## Parallel Development Strategy

### Track Assignment (Simulated)

**Track A: Frontend (Next.js)**
- Days 1-2: Project setup, UI components
- Days 3-4: Consent UI, Voice input UI
- Days 5-7: Text input, Document viewer, Lab results
- Days 11-13: Dashboard, Patient review, Referral
- Days 14-15: PWA, Offline storage
- Days 18-19: UI polish, Performance

**Track B: Backend (FastAPI)**
- Days 1-2: Project setup, Authentication, Database
- Days 3-4: Consent API, Voice API
- Days 5-7: Document API, Triage API
- Days 8-10: Rule engine, LLM integration
- Days 11-13: Queue API, Referral API
- Days 16-17: API tests, Security audit

**Track C: AI/ML Integration**
- Days 4-5: Bhashini integration, LLM setup
- Days 6-7: PaddleOCR, Lab extraction
- Days 8-10: Rule engine, LLM prompts
- Days 16-17: AI testing, Accuracy validation

**Track D: Privacy & Security**
- Days 3: Consent system, PII detection
- Days 8-10: Guardrails, Audit logging
- Days 16-17: Security audit, Privacy compliance

---

## Risk Mitigation

### High-Risk Items
1. **OCR Accuracy**: Bounding box extraction may be unreliable
   - Mitigation: Manual entry fallback, confidence thresholds
2. **LLM Integration**: API rate limits or downtime
   - Mitigation: Local Ollama fallback, response caching
3. **Voice Recognition**: Poor accuracy in noisy environments
   - Mitigation: Text input fallback, noise reduction
4. **Offline Sync**: Data conflicts during sync
   - Mitigation: Last-write-wins, manual conflict resolution

### Contingency Plans
- If OCR fails: Manual data entry form
- If LLM fails: Rule engine only (triage still functional)
- If voice fails: Text input only
- If internet fails: Full offline mode with local processing

---

## Success Metrics

### Technical Metrics
- Test coverage: >80%
- API response time: <500ms (p95)
- OCR accuracy: >85% (bounding boxes)
- Voice recognition accuracy: >80%
- Page load time: <2 seconds

### User Experience Metrics
- Time to complete triage: <5 minutes
- Doctor review time: <90 seconds per patient
- Offline functionality: 100% of core features
- Mobile responsiveness: 100% of screens

### Evaluation Metrics (Hackathon)
- Safety Workflow (20%): ✅ Hybrid engine + disclaimers
- Information Extraction (20%): ✅ OCR + LLM summarization
- Multimodal Capability (15%): ✅ Voice + OCR + Vision
- India Facility Relevance (15%): ✅ Offline + vernacular
- Human-Review Design (15%): ✅ Dashboard + attestation
- Privacy & AI Controls (10%): ✅ Consent + PII + RBAC
- Demo Quality (5%): ✅ Complete flow + polish

---

## Daily Routine

### Morning (4 hours)
- Review previous day's progress
- Plan today's tasks
- Implement core features
- Test implementation

### Afternoon (4 hours)
- Complete tasks
- Fix bugs
- Update documentation
- Commit code to git
- Prepare for next day

### End of Day
- Update todo list
- Review progress against plan
- Identify blockers
- Plan next day's tasks

---

## Tools & Resources

### Development Tools
- Node.js 18+
- Python 3.11+
- Git
- VS Code or similar IDE

### External Services
- Bhashini API (Speech-to-text)
- Gemini 1.5 Flash (LLM + Vision)
- Google Translation API (Optional)
- Ollama (Local LLM)

### Testing Tools
- pytest (Python)
- Jest (TypeScript)
- Playwright (E2E)
- OWASP ZAP (Security)
- Lighthouse (Performance)

### Documentation Tools
- Markdown
- Draw.io (Architecture diagrams)
- Storybook (Component docs)

---

## Critical Path

The critical path items that must be completed for a successful submission:

1. ✅ Safety guardrails (no diagnostic language)
2. ✅ Privacy controls (consent, PII, RBAC)
3. ✅ Hybrid triage engine (rules + LLM)
4. ✅ Multimodal ingestion (voice, OCR, text)
5. ✅ Doctor dashboard with queue
6. ✅ Offline-first PWA
7. ✅ Complete documentation
8. ✅ Working demo

---

## Next Steps

1. ✅ Create execution plan (this document)
2. ⏭️ Create SETUP.md with installation instructions
3. ⏭️ Create .env.example template
4. ⏭️ Initialize Next.js project
5. ⏭️ Initialize FastAPI backend
6. ⏭️ Start parallel development

---

## Remember

> "It will never diagnose you. It will make sure the person who can, has everything they need in ninety seconds."

Every task, every line of code, every decision must serve this mission. Safety first, privacy always.
