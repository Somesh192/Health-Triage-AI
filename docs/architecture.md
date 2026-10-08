# Architecture: Multimodal Healthcare Triage Assistant

## System Overview

**One-Line Vision**: An offline-first, multimodal triage assistant that transforms messy vernacular voice, text, and lab reports into 90-second structured doctor triage notes for Indian PHCs and health camps.

### Core Philosophy
- **Never Diagnose**: Organize information, highlight urgency, support faster review
- **90-Second Doctor Rule**: Present verified data instantly with 1-click source verification
- **India-First**: Designed for low-resource, multilingual, variable-connectivity contexts

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PATIENT INTAKE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Voice Input  │  │ Text Input   │  │ Doc Upload   │  │ Image Upload │        │
│  │ (Vernacular) │  │ (Multi-lang) │  │ (PDF/Image)  │  │ (Symptoms)   │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │                 │                 │
│         v                 v                 v                 v                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Bhashini API │  │ Translation  │  │ PaddleOCR    │  │ Vision API   │        │
│  │ STT (Indic)  │  │ Engine       │  │ + Bounding   │  │ (Gemini)     │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRIVACY & GOVERNANCE LAYER                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Consent      │  │ PII          │  │ Anonymization│  │ Audit Trail  │        │
│  │ Recorder     │  │ Detector     │  │ Engine       │  │ Logger       │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        OFFLINE-FIRST BUFFER LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────┐       │
│  │                      IndexedDB Queue (Browser)                        │       │
│  │  - Store patient data locally                                         │       │
│  │  - Sync when connectivity restored                                   │       │
│  │  - Support field workers without internet                            │       │
│  └──────────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      HYBRID TRIAGE ENGINE (DUAL-LAYER)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  LAYER A: DETERMINISTIC RULE ENGINE                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  - ICMR PHC/ESI Protocol Implementation                                   │   │
│  │  - Hard Safety Flags (Red/Amber/Green)                                    │   │
│  │  - Critical Vitals Thresholds:                                            │   │
│  │    * SpO2 < 90% → FORCED RED                                              │   │
│  │    * Systolic BP > 180 mmHg → FORCED RED                                  │   │
│  │    * Severe Dyspnea → FORCED RED                                          │   │
│  │    * Hemoglobin < 7.0 g/dL → AMBER                                        │   │
│  │    * Platelets < 50,000/μL → AMBER                                        │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                              │
│                                    v                                              │
│  LAYER B: LLM CLINICAL SUMMARIZER                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  - Llama-3.2 3B (Local) or Gemini 1.5 Flash (Cloud)                      │   │
│  │  - 5-Part Structured Triage Note:                                        │   │
│  │    1. Chief Complaint & Timeline                                          │   │
│  │    2. Extracted Vitals & Lab Alerts                                        │   │
│  │    3. Urgency Signals & Red Flags                                         │   │
│  │    4. Missing Information Detector                                        │   │
│  │    5. Suggested Questions for Reviewing Doctor                            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    v
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      DOCTOR REVIEWER DASHBOARD LAYER                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Color-Coded  │  │ 1-Click      │  │ ABDM         │  │ Referral     │        │
│  │ Queue Board  │  │ Source       │  │ Referral     │  │ Note Export  │        │
│  │ (Red/Amber/  │  │ Attestation  │  │ Generator    │  │ (PDF)         │        │
│  │ Green)       │  │ (Bounding    │  │              │  │              │        │
│  │              │  │ Box Highlight)│ │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Offline Storage**: IndexedDB (via Dexie.js)
- **PWA Support**: next-pwa

### Backend
- **API Framework**: FastAPI (Python)
- **Database**: SQLite (Local) + PostgreSQL (Production)
- **OCR Engine**: PaddleOCR + Tesseract
- **Speech-to-Text**: Bhashini API (Indic languages)

### AI/ML Layer
- **Rule Engine**: Custom Python (deterministic clinical rules)
- **LLM**: Llama-3.2 3B (Local via Ollama) or Gemini 1.5 Flash (Cloud)
- **Vision**: Gemini 1.5 Flash Pro for image understanding
- **Translation**: IndicTrans2 / Google Translation API

### Privacy & Security
- **PII Detection**: spaCy NER + Custom Regex
- **Consent Management**: Interactive consent recorder
- **Role-Based Access**: JWT + RBAC middleware
- **Audit Logging**: Structured JSON logs

---

## Module Deep Dive

### Module 1: Patient Intake & Multimodal Ingestion

#### 1.1 Voice Ingestion Pipeline
```
Voice Input (Hindi/Odia/Bengali/Telugu)
    ↓
Bhashini API (Real-time STT)
    ↓
Text Normalization
    ↓
Translation Engine (Indic → English if needed)
    ↓
Structured Symptom Extraction
```

**Key Features**:
- Support for 6+ Indian languages
- Real-time transcription with confidence scores
- Auto-detection of language
- Vocab normalization (e.g., "juka" → "fever")

#### 1.2 Document OCR & Visual Grounding
```
Upload (PDF/Image)
    ↓
Preprocessing (Deskew, Denoise)
    ↓
PaddleOCR (Text + Bounding Boxes)
    ↓
Value Extraction (Regex + LLM)
    ↓
Bounding Box Mapping (Value → Coordinates)
    ↓
Visual Highlighting (Original Document + Overlays)
```

**Supported Report Types**:
- CBC (Complete Blood Count)
- Blood Sugar (Fasting/PP)
- LFT (Liver Function Test)
- KFT (Kidney Function Test)
- Urine Analysis
- X-Ray Reports

**OCR Outputs**:
- Raw text
- Structured key-value pairs
- Bounding box coordinates (x1, y1, x2, y2)
- Confidence scores

#### 1.3 PII Anonymizer Engine
```
Raw Text/Input
    ↓
PII Detection (Aadhaar, Phone, Name, Address)
    ↓
Redaction Strategy (Replace with <PII_TYPE>)
    ↓
Anonymized Output
    ↓
LLM Processing (Cloud-safe)
```

**PII Types Detected**:
- Aadhaar numbers (12-digit pattern)
- Mobile numbers (10-digit)
- Names (NER-based)
- Addresses (NER-based)
- Age/Gender (optional anonymization)

---

### Module 2: Safety-First Hybrid Triage Engine

#### Layer A: Deterministic Rule Engine

**Implementation**: Python-based rule engine with priority queue

```python
# Critical Rules (ICMR PHC Protocols)
CRITICAL_RULES = {
    "SpO2_LT_90": {
        "condition": lambda v: v.get("spo2", 100) < 90,
        "urgency": "RED",
        "action": "IMMEDIATE_RESCUSCITATION",
        "message": "Critical oxygen saturation - Immediate doctor alert"
    },
    "SYS_BP_GT_180": {
        "condition": lambda v: v.get("systolic_bp", 120) > 180,
        "urgency": "RED",
        "action": "HYPERTENSIVE_CRISIS",
        "message": "Severe hypertension - Urgent evaluation"
    },
    "SEVERE_DYSPNEA": {
        "condition": lambda v: "severe" in v.get("breathing_difficulty", "").lower(),
        "urgency": "RED",
        "action": "RESPIRATORY_DISTRESS",
        "message": "Severe breathing difficulty - Immediate attention"
    }
}

# Warning Rules (Amber)
WARNING_RULES = {
    "HGB_LT_7": {
        "condition": lambda v: v.get("hemoglobin", 15) < 7.0,
        "urgency": "AMBER",
        "action": "SEVERE_ANEMIA",
        "message": "Severe anemia - Prioritize evaluation"
    },
    "PLATELETS_LT_50K": {
        "condition": lambda v: v.get("platelets", 250000) < 50000,
        "urgency": "AMBER",
        "action": "THROMBOCYTOPENIA",
        "message": "Low platelet count - Investigate cause"
    }
}
```

**Rule Priority**:
1. Critical Rules (RED) - Override everything
2. Warning Rules (AMBER) - If no critical
3. LLM Assessment - Baseline urgency suggestion

#### Layer B: LLM Clinical Summarizer

**Prompt Engineering Strategy**:

```
You are a clinical triage assistant for Indian PHCs. Your role is to ORGANIZE,
NOT DIAGNOSE. Extract and structure information for doctor review.

PATIENT INPUT:
{symptoms_text}
{extracted_vitals}
{lab_results}

TASK: Generate a 5-part triage note:

1. CHIEF COMPLAINT & TIMELINE:
   - Summarize primary complaint in 1-2 sentences
   - Include duration and progression

2. EXTRACTED VITALS & LAB ALERTS:
   - List all measured vitals with values
   - Flag abnormal lab values with reference ranges

3. URGENCY SIGNALS & RED FLAGS:
   - Identify any critical indicators
   - Cross-reference with ICMR PHC protocols

4. MISSING INFORMATION:
   - List essential data not provided
   - Suggest what should be collected

5. SUGGESTED QUESTIONS FOR DOCTOR:
   - 3-5 focused questions for the reviewing physician
   - Based on symptoms and findings

DISCLAIMER: This is a triage support tool. Only qualified medical professionals
can diagnose and prescribe treatment.
```

**LLM Output Format**:
```json
{
  "chief_complaint": "Patient reports fever for 5 days with...",
  "vitals_and_labs": {
    "temperature": "Not recorded",
    "spo2": "94%",
    "hemoglobin": "8.5 g/dL (Low: <12.0)"
  },
  "urgency_signals": [
    "Fever duration >3 days",
    "Low hemoglobin indicating anemia"
  ],
  "missing_info": [
    "Body temperature not measured",
    "Blood pressure not recorded"
  ],
  "suggested_questions": [
    "Any history of recent travel?",
    "Any bleeding symptoms?",
    "Previous hemoglobin levels?"
  ]
}
```

---

### Module 3: Doctor Reviewer Dashboard

#### 3.1 Color-Coded Queue Board
```
┌─────────────────────────────────────────────────────────────┐
│                    TRIAGE QUEUE                              │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ URGENCY  │ PATIENT  │ WAIT TIME│ SUMMARY  │ ACTION          │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│ [RED]    │ P-001    │ 2 min    │ SpO2 88% │ Review Now →    │
│ [RED]    │ P-002    │ 5 min    │ BP 190/  │ Review Now →    │
│ [AMBER]  │ P-003    │ 12 min   │ Hb 6.8   │ Review →        │
│ [GREEN]  │ P-004    │ 25 min   │ Routine  │ Review →        │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

**Features**:
- Auto-sort by urgency (RED first)
- Wait time tracking
- One-click patient card expansion
- Bulk actions (assign to MO, mark reviewed)

#### 3.2 1-Click Source Attestation
```
Hover over "Hb: 6.8 g/dL" → Highlights bounding box on original lab report
┌─────────────────────────────────────────────┐
│  LAB REPORT (CBC)                          │
│  ┌─────────────────────────────────────┐   │
│  │ Hemoglobin: [6.8] g/dL  ← HIGHLIGHT │   │
│  │ Reference: 12.0-16.0 g/dL            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Implementation**:
- Store bounding box coordinates in database
- Canvas overlay on document viewer
- Click-to-jump to source

#### 3.3 ABDM Referral Note Generator
```
Triage Note → ABDM Template → PDF Export
```

**Referral Note Contents**:
- Patient demographics (anonymized ID)
- Chief complaint summary
- Critical findings
- Urgency level
- Suggested specialist
- Facility details
- Referring officer signature

---

### Module 4: Multilingual Conversational AI Doctor & Digital Prescription Subsystem

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│              MULTILINGUAL CONVERSATIONAL AI & PRESCRIPTION SUBSYSTEM             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                    CLIENT VOICE & LANGUAGE LAYER (BROWSER)                │  │
│  │  - Web Speech API: STT (SpeechRecognition) matching native locale         │  │
│  │  - Web Speech API: TTS (SpeechSynthesis) natural doctor voice playback    │  │
│  │  - 7 Regional Languages: EN, OR (ଓଡ଼ିଆ), HI (हिन्दी), BN (বাংলা),          │  │
│  │    TE (తెలుగు), TA (தமிழ்), KN (ಕನ್ನಡ)                                    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                         │
│                                       v                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                    FASTAPI BACKEND (/api/ai/chat)                         │  │
│  │  - Ingests patient message, language context, and conversation history    │  │
│  │  - Employs Primary Healthcare Doctor system prompt                        │  │
│  │  - Calls Google Gemini API with fallback pipeline:                        │  │
│  │    * gemini-2.5-flash → gemini-1.5-flash → gemini-2.0-flash → 1.5-pro    │  │
│  │  - Generates compassionate, simple everyday vernacular doctor guidance    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                       │                                         │
│                                       v                                         │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │               DIGITAL PRESCRIPTION GENERATOR (/api/ai/generate-prescription)│  │
│  │  - Generates structured PHC Rx Slip with unique ID (PHC-RX-YYYYMMDD-XXXX)  │  │
│  │  - Structured Medicines: Name, Type, Dosage, Frequency, Timing, Duration  │  │
│  │  - Home care, dietary advice & red-flag emergency symptoms                 │  │
│  │  - Interactive UI preview modal with 1-click PDF print/export             │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### Offline-First Workflow
```
Field Worker (No Internet)
    ↓
Collect Data (Voice/Text/Docs)
    ↓
Store in IndexedDB (Browser)
    ↓
Queue for Sync
    ↓
[Connection Restored]
    ↓
Sync to Server (FastAPI)
    ↓
Process with Hybrid Engine
    ↓
Update Dashboard
```

### Online Workflow
```
Field Worker (Internet Available)
    ↓
Collect Data
    ↓
Direct API Call (FastAPI)
    ↓
Real-time Processing
    ↓
Instant Dashboard Update
```

---

## Privacy & Governance Architecture

### 1. Consent Pipeline
```
Patient Arrives → Interactive Consent Screen → Voice/Touch Confirmation
    ↓
Consent Recorded (Timestamp, Type, Location)
    ↓
Data Collection Begins
```

**Consent Types**:
- Voice recording consent
- Document upload consent
- AI processing consent
- Data storage consent (X days)

### 2. PII Anonymization Pipeline
```
Raw Data → PII Detection → Redaction → LLM Processing
    ↓
Anonymized Output → Reverse Mapping (Secure Vault) → Doctor View
```

**Anonymization Strategy**:
- Replace names with `<PATIENT_ID>`
- Replace Aadhaar with `<AADHAAR_RED>`
- Replace phone with `<PHONE_RED>`
- Store mapping in encrypted vault

### 3. Audit Trail
```json
{
  "event_id": "evt_12345",
  "timestamp": "2026-10-07T10:30:00Z",
  "user_id": "health_worker_01",
  "patient_id": "P-001",
  "action": "data_collection",
  "data_types": ["voice", "lab_report"],
  "consent_recorded": true,
  "pii_anonymized": true,
  "llm_processed": true
}
```

### 4. Role-Based Access Control (RBAC)
```
ROLES:
- ASHA Worker: Collect data only, view own patients
- Nurse: View queue, update vitals, no diagnosis
- Medical Officer: Full access, review, referral
- Admin: System config, audit logs, user management
```

---

## Deployment Architecture

### Development Environment
```
Frontend: Next.js Dev Server (localhost:3000)
Backend: FastAPI Uvicorn (localhost:8000)
Database: SQLite (local file)
LLM: Ollama (localhost:11434)
```

### Production Environment
```
Frontend: Vercel / Netlify (PWA optimized)
Backend: AWS Lambda / Google Cloud Functions
Database: PostgreSQL (AWS RDS)
LLM: Gemini 1.5 Flash API (Cloud) + Ollama (Edge)
OCR: PaddleOCR on GPU instances
Storage: AWS S3 (Encrypted)
```

### Edge Deployment (For PHCs)
```
Raspberry Pi 4 / Mini PC
- Local FastAPI server
- Local SQLite database
- Local Ollama (Llama-3.2 3B)
- Local PaddleOCR
- Sync to cloud when internet available
```

---

## Performance & Scalability

### Target Metrics
- Voice-to-Text Latency: <3 seconds
- OCR Processing: <5 seconds per page
- Triage Note Generation: <10 seconds
- Dashboard Load: <2 seconds
- Offline Storage: 1000+ patient records

### Optimization Strategies
- Web Workers for OCR processing
- Debounced voice input
- Cached LLM responses for similar cases
- Lazy loading for queue items
- Image compression before upload

---

## Integration Points

### External APIs
1. **Bhashini API**: Speech-to-text for Indic languages
2. **Gemini 1.5 Flash**: Vision + LLM processing
3. **ABDM Sandbox**: Referral note generation (future)
4. **Google Translation**: Fallback translation

### Internal Services
1. **FastAPI Backend**: Core processing engine
2. **Next.js Frontend**: User interface
3. **SQLite/PostgreSQL**: Data persistence
4. **Ollama**: Local LLM inference

---

## Security Considerations

### Data at Rest
- AES-256 encryption for patient data
- Encrypted database (SQLite using SQLCipher)
- Secure key management (AWS KMS)

### Data in Transit
- TLS 1.3 for all API calls
- Certificate pinning for mobile apps
- VPN for edge deployments

### Access Control
- JWT tokens with short expiry
- Multi-factor authentication for admins
- IP whitelisting for PHC networks

---

## Monitoring & Observability

### Metrics to Track
- Patient intake rate
- Average processing time
- OCR accuracy rate
- Urgency distribution (Red/Amber/Green)
- Offline sync success rate
- PII detection accuracy

### Logging Strategy
- Structured JSON logs
- Centralized log aggregation (ELK stack)
- Error tracking (Sentry)
- Performance monitoring (New Relic)

---

## Compliance & Standards

### Standards Alignment
- **ICMR PHC Protocols**: Clinical rule engine
- **ABDM**: Data standards and referral format
- **HIPAA**: Privacy controls (US benchmark)
- **Digital Personal Data Protection Act (India)**: Consent and data retention

### Certifications (Future)
- ISO 27001 (Information Security)
- ISO 13485 (Medical Device Quality)
- NABH (National Accreditation Board for Hospitals)

---

## Failure Modes & Recovery

### OCR Failure
- Fallback to manual entry
- Confidence score threshold
- Request re-upload

### LLM Failure
- Fallback to rule engine only
- Cached generic templates
- Manual triage by nurse

### Network Failure
- Offline mode activation
- Queue for sync
- Local processing only

### PII Detection Failure
- Manual review flag
- Strict data quarantine
- Admin override required

---

## Future Enhancements

### Phase 2 Features
- Integration with EMR systems
- Mobile app (React Native)
- Telemedicine handoff
- Predictive analytics (disease trends)
- ASHA worker training module

### Phase 3 Features
- Specialist AI models (dermatology, radiology)
- Real-time epidemic monitoring
- Integration with vaccine registries
- Multi-facility coordination
- Automated follow-up reminders

---

## Success Metrics

### Hackathon Evaluation
- Safety Workflow (20%): ✅ Hybrid rule engine + disclaimers
- Multimodal Extraction (15%): ✅ Voice + OCR + Vision
- India Facility Relevance (15%): ✅ Offline-first + vernacular
- Human-Review Design (15%): ✅ Dashboard + 1-click attestation
- Privacy & Responsible AI (10%): ✅ Consent + PII + RBAC
- Demo Quality (5%): ✅ Complete end-to-end flow

### Real-World Impact
- Reduced doctor review time: 90 seconds per patient
- Improved triage accuracy: Rule-based consistency
- Increased accessibility: Vernacular support
- Enhanced privacy: Built-in anonymization
