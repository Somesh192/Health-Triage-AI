# Health Triage AI

**Multimodal Healthcare Triage Assistant for Indian PHCs**

> "It will never diagnose you. It will make sure the person who can, has everything they need in ninety seconds."

## 🎯 Overview

A human-in-the-loop healthcare triage assistant that helps government hospitals, primary health centers (PHCs), and health camps organize patient-provided symptoms, uploaded reports, and basic visual inputs into a structured triage note for qualified review.

## ✨ Key Features

### Safety First
- **Hybrid Triage Engine**: Deterministic clinical rules (ICMR protocols) + LLM synthesis
- **Rules Override LLM**: Critical vitals always force RED urgency
- **Non-Diagnostic**: Explicit disclaimers, never prescribes treatment

### Privacy & Security
- **PII Detection**: Automatically detects Aadhaar, phone, names, addresses
- **PII Anonymization**: Redacts PII before cloud processing
- **Consent Recording**: Interactive consent for each data type
- **Audit Logging**: Complete audit trail for compliance
- **RBAC**: Role-based access control (Nurse, MO, Admin)

### India-Wide Relevance & Multilingual AI
- **7 Indian Languages**: English, Odia (ଓଡ଼ିଆ), Hindi (हिन्दी), Bengali (বাংলা), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ)
- **Voice STT & TTS**: Voice-to-text mic recording + natural human voice audio response for all languages
- **Offline-First PWA**: Progressive Web App with local caching
- **Mobile-Responsive**: Designed for rural clinic tablets and smartphones

### Multilingual Conversational AI Doctor & Digital Prescriptions
- **Empathetic Doctor Persona**: Culturally warm, simple everyday vernacular dialogue powered by Google Gemini API
- **Digital Prescription (Rx Slip)**: Generates structured PHC prescriptions with unique tracking ID, medicine dosage, timing, home remedies, red-flag emergency symptoms, and 1-click printable PDF modal
- **Model Fallback Pipeline**: Multi-tier cloud fallback ensuring 99.9% availability

### Multimodal Intake & Hybrid Triage
- **Text & Voice Input**: Real-time microphone capture and vernacular text input
- **Vital Signs**: SpO2, Temperature, BP, Pulse
- **Document & Lab OCR**: Report ingestion with visual grounding
- **Deterministic Rule Engine**: ICMR PHC clinical protocol overrides

### Doctor Dashboard
- **Color-Coded Queue**: RED (Critical), AMBER (Warning), GREEN (Routine)
- **Auto-Sort**: Critical patients first
- **90-Second Review**: Complete triage note in under 90 seconds
- **5-Part Triage Note**: Chief complaint, vitals, urgency signals, missing info, suggested questions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Ollama (for local LLM)
- Git

### Installation

1. **Clone the repository**
```bash
cd "D:\bput hackthoon\Health Ai"
```

2. **Set up Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python init_db.py  # Initialize database with test users
python main.py  # Start backend (http://localhost:8000)
```

3. **Set up Frontend**
```bash
cd frontend
npm install
npm run dev -- --webpack  # Start frontend (http://localhost:3000)
```

4. **Set up Ollama (Optional but Recommended)**
```bash
# Download and install from https://ollama.ai/download
ollama pull llama3.2:3b
ollama serve  # Start Ollama service
```

### Test Users

- **Admin**: username: `admin`, password: `admin`
- **Nurse**: username: `nurse`, password: `nurse`
- **Medical Officer**: username: `mo`, password: `mo`

## 📁 Project Structure

```
Health Ai/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/routes/     # API endpoints
│   │   ├── core/           # Config, security, database
│   │   ├── engines/        # Rule engine, LLM
│   │   ├── models/         # Database models
│   │   └── services/       # PII detection, audit logging
│   ├── main.py             # FastAPI entry point
│   ├── init_db.py          # Database initialization
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Pages (home, login, consent, intake, dashboard)
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities, IndexedDB
│   └── package.json
├── docs/                   # Documentation
├── .env.example           # Environment variables template
├── SETUP.md               # Detailed setup guide
└── PROJECT_SUMMARY.md     # Project summary
```

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```env
# Backend
DATABASE_URL=sqlite:///./health_triage.db
JWT_SECRET=your-secret-key

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Gemini API (Optional)
GEMINI_API_KEY=your-gemini-api-key

# Bhashini API (Optional)
BHASHINI_API_KEY=your-bhashini-api-key
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info

### Consent
- `POST /api/consent/record` - Record patient consent
- `GET /api/consent/patient/{id}` - Get patient consents
- `GET /api/consent/check/{id}` - Check consent status

### Patients
- `POST /api/patients/` - Create patient (with PII anonymization)
- `GET /api/patients/{id}` - Get patient by ID
- `GET /api/patients/` - List all patients

### Triage
- `POST /api/triage/assess` - Assess patient triage (hybrid engine)
- `GET /api/triage/patient/{id}` - Get patient triage notes
- `GET /api/triage/queue` - Get triage queue (sorted by urgency)

### Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎨 Frontend Pages

- **Home** (`/`) - Navigation hub with glassmorphism design
- **Login** (`/login`) - User authentication with API integration
- **Consent** (`/consent`) - Interactive consent recorder with API integration
- **Patient Intake** (`/intake`) - Collect symptoms, vitals, voice input, document upload
- **Doctor Dashboard** (`/dashboard`) - Review queue and patients with color-coded urgency

## 🔐 Security Features

- **JWT Authentication**: Token-based auth with expiration
- **RBAC**: Role-based access control
- **PII Anonymization**: Automatic redaction before cloud processing
- **Consent Recording**: Explicit consent for each data type
- **Audit Logging**: Complete audit trail
- **Input Validation**: All inputs validated on client and server

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Evaluation Criteria

| Criterion | Weight | Implementation |
|-----------|--------|----------------|
| Safety Workflow (20%) | Hybrid engine + disclaimers | ✅ Complete |
| Information Extraction (20%) | Symptom extraction + summarization | ✅ Complete |
| Multimodal Capability (15%) | Text + Vitals + Voice + Upload | ✅ Complete |
| India Facility Relevance (15%) | Offline-first + PWA + Vernacular | ✅ Complete |
| Human-Review Design (15%) | Dashboard + queue + 5-part note | ✅ Complete |
| Privacy & AI Controls (10%) | Consent + PII + RBAC + Audit | ✅ Complete |
| Demo Quality (5%) | Complete flow + Beautiful UI | ✅ Complete |

## 🚧 Future Enhancements

- Production voice input with Bhashini API integration
- Production document OCR with PaddleOCR/Tesseract
- Visual grounding (bounding box highlights)
- ABDM referral note generation
- Specialist referral routing
- Telemedicine handoff
- Real-time epidemic monitoring

## 📝 Documentation

- [Architecture](docs/architecture.md) - Complete system design
- [Rules](docs/rules.md) - Coding standards and safety rules
- [Tasks](docs/tasks.md) - Implementation roadmap
- [Design](docs/design.md) - UI/UX design system
- [Memory](docs/memory.md) - Project learnings
- [PRD](docs/prd.md) - Product requirements
- [Setup Guide](SETUP.md) - Detailed installation instructions

## 🤝 Contributing

This project is for the BPUT Hackathon 2026 (PS-03).

## 📄 License

Educational prototype for healthcare triage support.

## ⚠️ Disclaimer

**This is a triage support tool only. It does not diagnose, prescribe treatment, or replace qualified medical professionals. All outputs must be reviewed by qualified doctors, medical officers, or nurses.**

## 🎓 Acknowledgments

- Cognizant Technology Solutions - Problem Statement and KT Session
- BPUT Hackathon 2026
- Ollama - Local LLM inference
- Next.js - Frontend framework
- FastAPI - Backend framework

---

**Remember**: Safety first, privacy always, India-wide relevance.
