# Multimodal Healthcare Triage Assistant - Documentation Hub

Welcome to the comprehensive documentation for the **Multimodal Healthcare Triage Assistant (Health Triage AI)** built for BPUT Hackathon 2026 (Problem Statement PS-03 Cognizant).

---

## 🟢 Live System Status

- **Web Application Frontend**: [http://localhost:3000](http://localhost:3000) (Next.js 16 + Tailwind CSS)
- **FastAPI Backend Server**: [http://localhost:8000](http://localhost:8000) (Uvicorn + SQLAlchemy)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **AI Medical Engine**: Google Gemini Generative API (`gemini-2.5-flash`, `gemini-1.5-flash` with model fallbacks)
- **Voice System**: Web Speech API Speech-to-Text (STT) & SpeechSynthesis Text-to-Speech (TTS)
- **Supported Languages**: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Bengali (বাংলা), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ)

---

## 📁 Document Index

### 1. [architecture.md](./architecture.md)
**Complete system architecture and technical design**
- High-level architecture diagram and module interactions
- Multimodal Ingestion Pipeline (Voice, OCR, Text)
- Safety-First Hybrid Triage Engine (Deterministic ICMR Rules + LLM Summarization)
- Multilingual Conversational AI Doctor & Digital Prescription Subsystem
- Doctor Reviewer Dashboard and ABDM Referral Generator
- Privacy & Governance Architecture (Consent, PII Anonymization, RBAC, Audit Trails)
- Deployment, Security, and Scalability considerations

### 2. [prd.md](./prd.md)
**Product Requirements Document**
- Vision, goals, and target Indian healthcare facilities (PHCs, CHCs, health camps)
- User personas (Medical Officer, Staff Nurse, ASHA Worker, Rural Patient)
- Epics and User Stories:
  - Patient Intake, Consent & Privacy
  - Hybrid Triage Engine & Urgency Signal Detection
  - Doctor Reviewer Queue & 1-Click Source Attestation
  - Offline-First PWA storage
  - Multilingual Conversational AI Doctor Assistant
  - Digital Medical Prescription (Rx Slip) Generation Subsystem
- Functional & Non-Functional Requirements

### 3. [tasks.md](./tasks.md)
**Implementation Roadmap & Verified Status**
- Phase-by-phase completion checklist (Phases 1 through 8 fully verified)
- Live component status matrix
- Automated testing and verification milestones

### 4. [memory.md](./memory.md)
**Project Learnings & Architectural Decisions**
- Evaluator insights from Cognizant PS-03 problem statement
- Architectural decisions (Hybrid Triage Engine, Offline PWA, PII Redaction)
- Gemini API integration with multi-model fallback strategy
- Web Speech API integration for zero-latency vernacular voice interaction
- Digital Prescription data structures and safety guardrails

### 5. [rules.md](./rules.md)
**Coding Standards, Safety Rules, and Development Guidelines**
- Critical Safety Rules (Non-diagnostic enforcement, ICMR rule overrides, disclaimers)
- Privacy Rules (PII protection, consent first, data retention, RBAC)
- Python backend & TypeScript frontend coding conventions
- Code review checklists and test validation rules

---

## 🚀 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Backend system health check | No |
| `POST` | `/api/auth/login` | User authentication & JWT generation | No |
| `POST` | `/api/auth/register` | Healthcare personnel registration | No |
| `POST` | `/api/consent/record` | Patient consent logging | Yes (Bearer) |
| `POST` | `/api/patients/` | Create patient intake record | Yes (Bearer) |
| `POST` | `/api/triage/assess` | Run hybrid deterministic rule + LLM triage | Yes (Bearer) |
| `POST` | `/api/ai/chat` | Multilingual AI doctor conversational consultation | Optional |
| `POST` | `/api/ai/generate-prescription` | Generate structured PHC Digital Prescription (Rx Slip) | Optional |

---

## 💡 Quick Start

1. **Start Backend**:
   ```bash
   cd backend
   .\venv\Scripts\activate
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Open [http://localhost:3000](http://localhost:3000) in your browser.
