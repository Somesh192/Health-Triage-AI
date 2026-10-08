# Memory: Project Learnings & Architectural Decisions

## Project Overview

**Project Name**: Multimodal Healthcare Triage Assistant (Health Triage AI)  
**Hackathon**: BPUT Hackathon 2026 (Problem Statement PS-03 Cognizant)  
**Core Mission**: *"It will never replace a doctor. It makes sure the patient and medical officer have clear, safe, rapid, and culturally comfortable healthcare communication in ninety seconds."*

---

## Key Evaluator Insights (Cognizant PS-03)

1. **Non-Diagnostic Safety & Responsible Guidance**:
   - Clear disclaimers on every interaction.
   - Deterministic clinical safety rules based on ICMR PHC guidelines take precedence over AI outputs.
   - Prescriptions provide supportive OTC guidance, home care, and clear instructions while emphasizing certified doctor consultation for critical symptoms.

2. **Multimodal & Multilingual Ingestion**:
   - Voice input (STT) and voice playback (TTS) eliminating literacy and communication barriers.
   - Support for 7 regional Indian languages (English, Odia, Hindi, Bengali, Telugu, Tamil, Kannada).
   - Natural human conversational tone appropriate for rural and semi-urban patients.

3. **India Facility & PHC Relevance**:
   - Designed for Community Health Centers (CHCs) and Primary Health Centers (PHCs).
   - Works seamlessly on modern browsers and mobile devices.
   - Printable and downloadable Digital Medical Prescription (Rx Slip) for pharmacy presentation.

4. **Doctor Review & Rapid Handoff**:
   - Color-coded triage queue (RED / AMBER / GREEN).
   - Structured 5-part triage notes and ABDM referral documentation.

---

## Architectural & Technical Decisions

### Decision 1: Hybrid Gemini AI & Fallback Strategy
- **Why**: Medical triage and patient dialogue require low-latency, empathetic reasoning across multiple Indian languages.
- **Solution**:
  - Primary: Google Gemini Generative API (`gemini-2.5-flash` / `gemini-1.5-flash`).
  - Fallback models: `gemini-2.0-flash`, `gemini-1.5-pro` with automatic model fallback iteration.
  - Offline / Network Failure Fallback: Embedded rule-based multilingual triage responses ensuring continuous availability even if external networks fluctuate.

### Decision 2: Web Speech API for Real-Time STT & TTS
- **Why**: Third-party speech APIs can introduce latency, credential issues, and rate limits.
- **Solution**:
  - Leveraged native browser `webkitSpeechRecognition` / `SpeechRecognition` with locale mapping (`en-IN`, `or-IN`, `hi-IN`, `bn-IN`, `te-IN`, `ta-IN`, `kn-IN`).
  - Leveraged `window.speechSynthesis` for natural voice readout of doctor recommendations.
  - Zero-latency client-side audio capture without heavy audio payload uploads.

### Decision 3: Digital Prescription (Rx Slip) Generation
- **Why**: Patients need concrete, neatly formatted documentation for pharmacy purchase and home care after consultation.
- **Solution**:
  - Dedicated `/api/ai/generate-prescription` endpoint producing structured JSON:
    - Unique Rx identifier (`PHC-RX-YYYYMMDD-XXXX`)
    - PHC header & patient details
    - Clinical assessment and symptom summary
    - Structured medicines array (Name, Type, Dosage, Frequency, Timing, Duration, Instructions, Precautions)
    - Home care and dietary recommendations
    - Emergency red-flag warning indicators
  - Interactive UI modal offering full preview and one-click PDF printing.

### Decision 4: Windows Process Management & Daemon Execution
- **Why**: On Windows environments, restarting uvicorn during rapid iterations can leave orphan python socket bindings on port 8000.
- **Solution**:
  - Automated zombie process cleanup via `taskkill /F /IM python.exe` before clean daemon starts.
  - Dedicated background process management ensuring both frontend (`:3000`) and backend (`:8000`) run concurrently.

---

## System Evolution Timeline

| Phase | Focus | Status |
|---|---|---|
| **Phase 1** | Foundation, SQLite database, FastAPI backend, Next.js frontend | Completed |
| **Phase 2** | JWT Authentication, RBAC (Nurse, Doctor, Admin), Audit Logging | Completed |
| **Phase 3** | Consent Capture UI, PII Anonymization Engine | Completed |
| **Phase 4** | Multimodal intake, Lab OCR pipeline, ICMR deterministic rule engine | Completed |
| **Phase 5** | Clinical doctor dashboard, Triage queue, ABDM referral generation | Completed |
| **Phase 6** | Gemini AI Chatbot, 7-Language support, STT/TTS Voice Chat, Digital Rx Slip | Completed & Verified |
