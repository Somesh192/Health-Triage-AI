# PRD: Product Requirements Document

## Document Information

**Product Name**: Multimodal Healthcare Triage Assistant
**Version**: 1.0
**Last Updated**: 2026-10-07
**Author**: Development Team
**Status**: Draft

---

## Executive Summary

### One-Line Vision
An offline-first, multimodal triage assistant that transforms messy vernacular voice, text, and lab reports into 90-second structured doctor triage notes for Indian PHCs and health camps.

### Problem Statement
Government hospitals, primary health centers (PHCs), public health camps, company clinics, industrial-estate health units, and campus health centers across India face overwhelming patient loads, language diversity, specialist shortages, and varying digital maturity. Medical officers see 100+ patients daily, spending precious time organizing messy patient data instead of focusing on diagnosis and treatment.

### Solution
A human-in-the-loop healthcare triage assistant that:
- Collects symptoms through voice (vernacular) or text
- Extracts key details from medical reports via OCR
- Summarizes patient information into structured triage notes
- Identifies missing information and generates follow-up questions
- Highlights urgency signals for prioritization
- Supports offline operation for low-resource settings
- Ensures privacy through consent, PII anonymization, and audit trails

### Target Users
- **Primary**: Medical Officers (MOs) at PHCs
- **Secondary**: Nurses and health workers
- **Tertiary**: ASHA workers in field settings

### Target Facilities
- Primary Health Centers (PHCs)
- Community Health Centers (CHCs)
- District Hospitals
- Public Health Camps
- Industrial Estate Health Units
- Campus Health Centers
- Company Clinics

---

## Product Vision

### North Star
> "It will never diagnose you. It will make sure the person who can, has everything they need in ninety seconds."

### Success Definition
A medical officer at a PHC can review a patient's complete triage note, verify source documents, and make an informed decision in under 90 seconds.

### Long-Term Vision
Become the standard triage support tool across India's public health infrastructure, reducing doctor review time by 50% while improving triage accuracy and patient outcomes.

---

## Product Goals

### Primary Goals
1. **Reduce Doctor Review Time**: From 5-10 minutes to under 90 seconds per patient
2. **Improve Triage Accuracy**: Rule-based consistency reduces human error
3. **Increase Accessibility**: Vernacular support and offline-first design
4. **Enhance Privacy**: Built-in consent, PII anonymization, and audit trails

### Secondary Goals
1. **Standardize Triage**: Consistent 5-part triage note format
2. **Enable Referrals**: ABDM-compliant referral note generation
3. **Support Research**: Anonymized data for public health insights
4. **Scale Nationwide**: Deploy to 1000+ PHCs in 3 years

---

## User Personas

### Persona 1: Dr. Priya Sharma (Medical Officer)
**Age**: 35
**Role**: Medical Officer at PHC in rural Odisha
**Context**: Sees 100+ patients daily, 6-hour OPD shifts
**Pain Points**:
- Overwhelmed by patient volume
- Variable quality of patient data collection
- Language barriers with patients
- Limited time per patient
- Poor internet connectivity

**Goals**:
- Review patients quickly and accurately
- Prioritize critical cases
- Make informed referrals
- Maintain patient safety

**Success Metric**: Can review a patient in under 90 seconds with complete information

---

### Persona 2: Sunita Behera (ASHA Worker)
**Age**: 28
**Role**: ASHA worker in field settings
**Context**: Collects patient data in villages, speaks Odia
**Pain Points**:
- Limited technical training
- Poor internet in villages
- Vernacular language only
- Paper-based records (lost/damaged)
- No triage guidance

**Goals**:
- Collect patient data accurately
- Record symptoms in local language
- Upload lab reports easily
- Get triage guidance

**Success Metric**: Can complete patient intake in under 5 minutes

---

### Persona 3: Nurse Rani (Staff Nurse)
**Age**: 32
**Role**: Staff Nurse at PHC
**Context**: Assists MO, manages queue, records vitals
**Pain Points**:
- Manual data entry (time-consuming)
- Missed critical vitals
- Queue management chaos
- No triage prioritization
- Paper-based records

**Goals**:
- Record vitals quickly
- Prioritize queue by urgency
- Assist MO efficiently
- Reduce manual work

**Success Metric**: Can record vitals and add to queue in under 2 minutes

---

## User Stories

### Epic 1: Patient Intake

#### Story 1.1: Voice Symptom Collection
**As a** ASHA worker
**I want to** record patient symptoms by speaking in my local language
**So that** I can collect data quickly without typing

**Acceptance Criteria**:
- Support for Hindi, Odia, Bengali, Telugu
- Real-time transcription display
- Confidence score indicator
- Auto-detection of language
- Text input fallback
- Max 5-minute recording duration

**Priority**: High
**Effort**: 8 story points

---

#### Story 1.2: Text Symptom Input
**As a** Nurse
**I want to** type patient symptoms in English or local language
**So that** I can collect data when voice is not feasible

**Acceptance Criteria**:
- Multi-language text input
- Character count indicator
- Auto-save draft
- Validation (min 10 characters)
- Support for regional scripts

**Priority**: High
**Effort**: 3 story points

---

#### Story 1.3: Document Upload
**As a** Health worker
**I want to** upload lab reports (PDF/images)
**So that** the system can extract values automatically

**Acceptance Criteria**:
- Support PDF, JPG, PNG formats
- Max file size 10MB
- Drag and drop upload
- Progress indicator
- Multiple file upload
- Thumbnail preview

**Priority**: High
**Effort**: 5 story points

---

#### Story 1.4: Vitals Recording
**As a** Nurse
**I want to** record patient vital signs
**So that** doctors have complete information

**Acceptance Criteria**:
- Fields: SpO2, Temperature, Systolic BP, Diastolic BP
- Validation (min/max values)
- Real-time urgency indicator
- Reference ranges display
- Unit indicators
- Required field validation

**Priority**: High
**Effort**: 5 story points

---

### Epic 2: Consent & Privacy

#### Story 2.1: Interactive Consent
**As a** Patient
**I want to** give explicit consent for data collection
**So that** my privacy is protected

**Acceptance Criteria**:
- Separate consents for: voice, documents, AI processing, storage
- Clear language in vernacular
- Audio/touch confirmation
- Timestamp recording
- Withdrawal capability
- Privacy policy link

**Priority**: Critical
**Effort**: 8 story points

---

#### Story 2.2: PII Anonymization
**As a** System
**I want to** automatically detect and redact PII
**So that** patient privacy is protected

**Acceptance Criteria**:
- Detect: Aadhaar, phone, name, address
- Redact with placeholders
- Store original in encrypted vault
- Before cloud LLM processing
- Display anonymized data to staff
- Doctor can view original with authentication

**Priority**: Critical
**Effort**: 8 story points

---

#### Story 2.3: Audit Trail
**As a** Admin
**I want to** view audit logs of all data access
**So that** I can ensure compliance

**Acceptance Criteria**:
- Log: data collection, consent, PII anonymization, LLM processing, doctor review
- Structured JSON format
- Exportable logs
- Searchable by patient/user/date
- Tamper-proof (append-only)

**Priority**: High
**Effort**: 5 story points

---

### Epic 3: Triage Engine

#### Story 3.1: Rule-Based Urgency
**As a** System
**I want to** apply deterministic clinical rules
**So that** critical cases are flagged immediately

**Acceptance Criteria**:
- SpO2 < 90% → RED (Immediate)
- Systolic BP > 180 mmHg → RED
- Severe dyspnea → RED
- Hemoglobin < 7.0 g/dL → AMBER
- Platelets < 50,000/μL → AMBER
- Rule engine runs before LLM
- Rules override LLM suggestions

**Priority**: Critical
**Effort**: 8 story points

---

#### Story 3.2: LLM Summarization
**As a** System
**I want to** generate a 5-part triage note using LLM
**So that** information is structured for doctor review

**Acceptance Criteria**:
- 5-part output: Chief Complaint, Vitals & Labs, Urgency Signals, Missing Info, Suggested Questions
- Prompt guardrails (no diagnostic language)
- Disclaimer in every response
- Post-processing filter
- Fallback to rule engine if LLM fails

**Priority**: High
**Effort**: 8 story points

---

#### Story 3.3: Missing Information Detection
**As a** System
**I want to** identify missing critical information
**So that** health workers can collect it

**Acceptance Criteria**:
- Detect missing: temperature, BP, lab results
- Display missing info list
- Suggest what to collect
- Flag incomplete triage notes
- Allow resubmission after adding data

**Priority**: Medium
**Effort**: 5 story points

---

### Epic 4: Doctor Dashboard

#### Story 4.1: Color-Coded Queue
**As a** Medical Officer
**I want to** see patients sorted by urgency
**So that** I can prioritize critical cases

**Acceptance Criteria**:
- Color coding: RED, AMBER, GREEN
- Auto-sort (RED first)
- Wait time display
- One-line summary per patient
- Filter by urgency
- Search by patient ID

**Priority**: High
**Effort**: 5 story points

---

#### Story 4.2: Patient Review
**As a** Medical Officer
**I want to** review complete patient information
**So that** I can make informed decisions

**Acceptance Criteria**:
- Display 5-part triage note
- Show source documents
- Highlight abnormal values
- Display suggested questions
- Show missing information
- 90-second review target

**Priority**: High
**Effort**: 8 story points

---

#### Story 4.3: Source Attestation
**As a** Medical Officer
**I want to** verify extracted values from source documents
**So that** I can trust the data

**Acceptance Criteria**:
- Hover over value → highlight bounding box on document
- Click value → jump to source
- Display confidence score
- Show original document image
- Allow manual override

**Priority**: High
**Effort**: 8 story points

---

#### Story 4.4: Referral Generation
**As a** Medical Officer
**I want to** generate ABDM-compliant referral notes
**So that** I can refer patients to higher facilities

**Acceptance Criteria**:
- ABDM template format
- Include: patient ID, findings, urgency, suggested specialist
- PDF export
- Doctor signature capture
- Auto-populate from triage note
- Send to district hospital (future)

**Priority**: Medium
**Effort**: 5 story points

---

### Epic 5: Offline-First

#### Story 5.1: Offline Data Collection
**As a** ASHA worker
**I want to** collect patient data without internet
**So that** I can work in remote villages

**Acceptance Criteria**:
- Store data in IndexedDB
- Queue for sync when online
- Local rule engine processing
- Offline mode indicator
- Sync status display
- Conflict resolution UI

**Priority**: High
**Effort**: 8 story points

---

#### Story 5.2: Sync Mechanism
**As a** System
**I want to** sync data when internet is available
**So that** data is consistent across devices

**Acceptance Criteria**:
- Auto-detect connectivity
- Sync queued data
- Last-write-wins conflict resolution
- Sync progress indicator
- Manual sync trigger
- Error handling and retry

**Priority**: High
**Effort**: 5 story points

---

### Epic 6: Multimodal Processing

#### Story 6.1: OCR with Bounding Boxes
**As a** System
**I want to** extract text with bounding box coordinates
**So that** doctors can verify sources

**Acceptance Criteria**:
- PaddleOCR integration
- Bounding box extraction (x1, y1, x2, y2)
- Confidence scoring
- Support for printed and handwritten text
- Preprocessing (deskew, denoise)
- Support for PDF and images

**Priority**: High
**Effort**: 8 story points

---

#### Story 6.2: Lab Value Extraction
**As a** System
**I want to** extract lab values from OCR text
**So that** abnormal values are flagged

**Acceptance Criteria**:
- Extract: test name, value, unit, reference range
- Normalize units
- Compare with reference ranges
- Flag abnormal values
- Map to bounding boxes
- Support common report types (CBC, Blood Sugar, LFT)

**Priority**: High
**Effort**: 8 story points

---

#### Story 6.3: Visual Grounding
**As a** System
**I want to** highlight abnormal values on original document
**So that** doctors can verify quickly

**Acceptance Criteria**:
- Canvas overlay on document viewer
- Colored bounding boxes (red for abnormal)
- Hover effect on highlights
- Click to show details
- Zoom and pan support
- Responsive on mobile

**Priority**: High
**Effort**: 5 story points

---

### Epic 7: Multilingual Conversational AI Doctor & Voice Chat

#### Story 7.1: Multilingual Human-like Doctor Dialogue
**As a** patient visiting a PHC / clinic
**I want to** consult with an AI medical assistant in my native language
**So that** I feel heard, comfortable, and understand the medical guidance completely

**Acceptance Criteria**:
- Support for 7 regional languages: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Bengali (বাংলা), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ)
- Caring, compassionate, simple everyday Indian doctor persona
- No confusing jargon; immediate plain-language explanations of any medical term
- Integration with Google Gemini Generative API with multi-model fallback pipeline

**Priority**: High
**Effort**: 8 story points

---

#### Story 7.2: Speech-to-Text & Text-to-Speech Voice Interaction
**As a** patient or rural elder
**I want to** speak via my microphone and listen to the doctor's spoken response
**So that** communication barriers and literacy challenges are completely eliminated

**Acceptance Criteria**:
- Web Speech API microphone STT recording matching selected language locale
- Text-to-Speech (TTS) natural voice playback of doctor guidance
- Real-time recording indicator and audio toggle controls

**Priority**: High
**Effort**: 5 story points

---

### Epic 8: Digital Medical Prescription (Rx Slip) Generation

#### Story 8.1: Structured Clinical Prescription Output
**As a** patient or healthcare attendant
**I want to** receive an organized, valid digital prescription slip after consultation
**So that** I have clear medicine names, dosages, timing, home care, and pharmacy instructions

**Acceptance Criteria**:
- Unique prescription tracking ID (`PHC-RX-YYYYMMDD-XXXX`)
- Clinical assessment and symptoms summary
- Structured medicines list (Name, Type, Dosage, Frequency, Timing, Duration, Instructions, Precautions)
- Home care, dietary advice & red-flag warning indicators
- Interactive UI modal with instant Print / PDF export capabilities

**Priority**: High
**Effort**: 8 story points

---

## Functional Requirements

### FR-1: Patient Intake
- The system shall allow voice input in Hindi, Odia, Bengali, Telugu, Tamil, Kannada, English
- The system shall allow text input in English and regional languages
- The system shall allow document upload (PDF, JPG, PNG)
- The system shall record vital signs (SpO2, Temperature, BP)
- The system shall validate all inputs before submission
- The system shall auto-save drafts to prevent data loss

### FR-2: Consent & Privacy
- The system shall require explicit consent before data collection
- The system shall record consent type, timestamp, and user
- The system shall detect and redact PII before cloud processing
- The system shall store original PII in encrypted vault
- The system shall log all data access events
- The system shall allow consent withdrawal

### FR-3: Triage Engine
- The system shall apply deterministic clinical rules before LLM
- The system shall flag critical vitals (SpO2 < 90%, BP > 180)
- The system shall generate 5-part triage notes
- The system shall include disclaimer in all outputs
- The system shall identify missing information
- The system shall suggest questions for doctor

### FR-4: Doctor Dashboard
- The system shall display color-coded patient queue
- The system shall auto-sort queue by urgency
- The system shall show wait time for each patient
- The system shall allow one-click patient review
- The system shall display source documents with highlights
- The system shall generate ABDM referral notes

### FR-5: Offline-First
- The system shall store data locally in IndexedDB
- The system shall queue data for sync when online
- The system shall process triage locally using rule engine
- The system shall display offline status indicator
- The system shall sync data when connectivity restored
- The system shall resolve sync conflicts

### FR-6: Multimodal Processing
- The system shall extract text with bounding boxes from documents
- The system shall extract lab values with reference ranges
- The system shall flag abnormal lab values
- The system shall highlight abnormal values on original document
- The system shall support handwritten text recognition
- The system shall preprocess images (deskew, denoise)

### FR-7: Multilingual Conversational AI Assistant
- The system shall provide warm, natural conversational consultations via Google Gemini in 7 Indian languages
- The system shall provide Web Speech API STT mic input
- The system shall provide Web Speech API TTS audio playback

### FR-8: Digital Medical Prescription
- The system shall generate structured PHC digital prescription slips with unique IDs
- The system shall include structured medicine instructions, dosage, timing, home care, and red-flag emergency symptoms
- The system shall provide a printable and downloadable PDF prescription modal

---

## Non-Functional Requirements

### NFR-1: Performance
- The system shall load the dashboard in under 2 seconds
- The system shall process OCR in under 5 seconds per page
- The system shall generate triage notes in under 10 seconds
- The system shall transcribe voice in under 3 seconds
- The system shall support 1000+ concurrent users

### NFR-2: Reliability
- The system shall have 99.5% uptime
- The system shall have automatic failover for cloud services
- The system shall recover from crashes without data loss
- The system shall have data backup every 24 hours

### NFR-3: Scalability
- The system shall scale to 10,000 daily patients
- The system shall handle 1000+ concurrent users
- The system shall support horizontal scaling
- The system shall use load balancing

### NFR-4: Security
- The system shall encrypt data at rest (AES-256)
- The system shall use TLS 1.3 for data in transit
- The system shall implement RBAC for all data access
- The system shall log all security events
- The system shall undergo quarterly security audits

### NFR-5: Privacy
- The system shall anonymize PII before cloud processing
- The system shall retain data for maximum 30 days
- The system shall allow data export on patient request
- The system shall comply with Digital Personal Data Protection Act
- The system shall have privacy impact assessment

### NFR-6: Usability
- The system shall be WCAG 2.1 AA compliant
- The system shall support keyboard navigation
- The system shall have contrast ratio ≥4.5:1
- The system shall support screen readers
- The system shall have vernacular language support

### NFR-7: Compatibility
- The system shall work on Chrome, Firefox, Safari, Edge
- The system shall work on Android 8+ and iOS 12+
- The system shall work on 2GB RAM devices
- The system shall work on 3G networks

### NFR-8: Maintainability
- The system shall have 80%+ code coverage
- The system shall have automated testing pipeline
- The system shall have documented API endpoints
- The system shall have architectural decision records

---

## Technical Requirements

### TR-1: Frontend
- Framework: Next.js 14 with TypeScript
- Styling: TailwindCSS
- State Management: Zustand
- Offline Storage: IndexedDB (Dexie.js)
- PWA: next-pwa

### TR-2: Backend
- Framework: FastAPI (Python)
- Database: SQLite (dev) + PostgreSQL (prod)
- Authentication: JWT + RBAC
- API Documentation: OpenAPI/Swagger

### TR-3: AI/ML
- OCR: PaddleOCR + Tesseract
- Speech-to-Text: Bhashini API
- LLM: Llama-3.2 3B (Ollama) + Gemini 1.5 Flash
- Translation: IndicTrans2 / Google Translation
- PII Detection: spaCy + Regex

### TR-4: Infrastructure
- Frontend Hosting: Vercel
- Backend Hosting: AWS Lambda
- Database: AWS RDS PostgreSQL
- Storage: AWS S3 (Encrypted)
- CDN: CloudFront

### TR-5: Monitoring
- Logging: Structured JSON logs
- Error Tracking: Sentry
- Performance: New Relic
- Uptime: Pingdom

---

## Data Requirements

### DR-1: Patient Data
- Anonymous patient ID (not real name)
- Age, gender (optional)
- Symptoms (text/voice)
- Vitals (SpO2, Temperature, BP)
- Lab reports (documents + extracted values)
- Consent records
- Timestamps

### DR-2: Triage Data
- Urgency level (RED/AMBER/GREEN)
- 5-part triage note
- Urgency signals
- Missing information
- Suggested questions
- Rule engine output
- LLM output

### DR-3: Audit Data
- Event ID
- Timestamp
- User ID
- Patient ID
- Action type
- Data types
- Consent status
- PII anonymization status

### DR-4: Metadata
- Document metadata (type, size, upload time)
- OCR metadata (confidence, processing time)
- LLM metadata (model, prompt, response time)
- Sync metadata (status, conflict resolution)

---

## Integration Requirements

### IR-1: Bhashini API
- Speech-to-text for Indic languages
- Real-time transcription
- Language auto-detection
- Confidence scores

### IR-2: Gemini 1.5 Flash
- Vision API for image understanding
- LLM for summarization
- Fallback when local LLM fails

### IR-3: ABDM Sandbox (Future)
- Referral note generation
- Patient ID verification
- Health record exchange

### IR-4: Government Systems (Future)
- Integration with state health portals
- Disease reporting
- Analytics dashboard

---

## Compliance Requirements

### CR-1: Medical Safety
- Non-diagnostic by design
- Explicit disclaimers
- Rule-based safety overrides
- Doctor review required
- No prescription generation

### CR-2: Data Privacy
- Digital Personal Data Protection Act compliance
- Consent before collection
- PII anonymization
- Data retention limits
- Right to deletion

### CR-3: Accessibility
- WCAG 2.1 AA compliance
- Vernacular language support
- Screen reader compatible
- Keyboard navigation
- Color contrast compliance

### CR-4: Clinical Standards
- ICMR PHC protocol alignment
- ABDM format compliance
- NABH standards (future)
- ISO 13485 (future)

---

## Success Metrics

### SM-1: User Adoption
- Number of PHCs deployed: Target 100 in Year 1
- Daily active users: Target 500 in Year 1
- Patient throughput: Target 10,000/day in Year 1

### SM-2: Efficiency
- Doctor review time: Target <90 seconds
- Patient intake time: Target <5 minutes
- Triage accuracy: Target >95%
- Queue reduction: Target 30%

### SM-3: Quality
- OCR accuracy: Target >85%
- Voice recognition accuracy: Target >80%
- User satisfaction: Target >4/5
- System uptime: Target 99.5%

### SM-4: Safety
- Zero diagnostic outputs
- Zero privacy breaches
- 100% consent compliance
- 100% PII anonymization

---

## Risks & Mitigations

### Risk 1: OCR Inaccuracy
**Probability**: High
**Impact**: High
**Mitigation**:
- Confidence score threshold
- Manual entry fallback
- User verification of extracted values
- Regular model retraining

### Risk 2: LLM Hallucination
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Rule engine override
- Prompt guardrails
- Post-processing filter
- Doctor review required

### Risk 3: Privacy Breach
**Probability**: Low
**Impact**: Critical
**Mitigation**:
- PII anonymization before cloud
- Encryption at rest and in transit
- RBAC enforcement
- Regular security audits

### Risk 4: User Adoption Resistance
**Probability**: Medium
**Impact**: High
**Mitigation**:
- User training programs
- Simplified UI
- Vernacular support
- Pilot with early adopters

### Risk 5: Regulatory Changes
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Legal review of data practices
- Compliance monitoring
- Flexible architecture for changes
- Engage with regulators early

---

## Assumptions & Dependencies

### Assumptions
- PHCs have basic internet connectivity (intermittent is OK)
- Health workers have smartphones or tablets
- Doctors have laptops or tablets
- Bhashini API remains free for research
- Gemini API pricing remains reasonable
- ICMR protocols remain stable

### Dependencies
- Bhashini API availability
- Gemini API availability
- Ollama for local LLM
- PaddleOCR for OCR
- Internet connectivity for cloud features
- Government approval for ABDM integration

---

## Constraints

### Budget Constraints
- Development cost: Minimal (hackathon)
- Cloud costs: <$100/month for pilot
- Hardware cost: Raspberry Pi for edge deployment

### Time Constraints
- Hackathon submission: 3 weeks
- Pilot deployment: 3 months
- Full rollout: 12 months

### Technical Constraints
- Must work offline
- Must work on low-end devices
- Must support vernacular languages
- Must be non-diagnostic

### Regulatory Constraints
- Must comply with Indian data protection laws
- Must not require medical device certification (prototype)
- Must have explicit disclaimers

---

## Roadmap

### Phase 1: MVP (Weeks 1-3) - Hackathon
- ✅ Patient intake (voice, text, documents)
- ✅ Consent and privacy
- ✅ Hybrid triage engine
- ✅ Doctor dashboard
- ✅ Offline-first PWA
- ✅ Basic OCR with bounding boxes

### Phase 2: Pilot (Months 4-6)
- Deploy to 5 PHCs
- User training
- Bug fixes and improvements
- Mobile app (React Native)
- Advanced OCR (handwritten)
- Specialist referral routing

### Phase 3: Scale (Months 7-12)
- Deploy to 100 PHCs
- ABDM integration
- EMR system integration
- Predictive analytics
- Telemedicine handoff
- Multi-facility coordination

### Phase 4: Ecosystem (Year 2+)
- Deploy to 1000+ PHCs
- Disease surveillance
- Vaccine registry integration
- ASHA training platform
- Research data portal
- International expansion

---

## Stakeholders

### Internal
- Development Team
- Product Manager
- Clinical Advisors
- UX Designers

### External
- Cognizant (Hackathon Sponsor)
- BPUT (Hackathon Organizer)
- PHC Medical Officers
- ASHA Workers
- State Health Department
- ABDM Authority

---

## Glossary

- **ABDM**: Ayushman Bharat Digital Mission
- **ASHA**: Accredited Social Health Activist
- **CHC**: Community Health Center
- **ICMR**: Indian Council of Medical Research
- **LLM**: Large Language Model
- **MO**: Medical Officer
- **OCR**: Optical Character Recognition
- **PHC**: Primary Health Center
- **PII**: Personally Identifiable Information
- **PWA**: Progressive Web App
- **RBAC**: Role-Based Access Control

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-10-07 | Dev Team | Initial PRD for hackathon |

---

## Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Tech Lead | | | |
| Clinical Advisor | | | |
| Sponsor | | | |

---

## Appendix

### A. Evaluation Criteria Mapping
- Safety Workflow (20%): FR-3, NFR-6
- Information Extraction (20%): FR-6, TR-3
- Multimodal Capability (15%): FR-1, FR-6
- India Facility Relevance (15%): FR-5, NFR-7
- Human-Review Design (15%): FR-4
- Privacy & AI Controls (10%): FR-2, NFR-5
- Demo Quality (5%): All FRs and NFRs

### B. User Flow Diagrams
[To be added in design document]

### C. API Specifications
[To be added in technical documentation]

### D. Database Schema
[To be added in technical documentation]

---

## Remember

> "It will never diagnose you. It will make sure the person who can, has everything they need in ninety seconds."

This PRD exists to ensure we build the right product for the right users, with safety, privacy, and India-wide relevance at its core.
