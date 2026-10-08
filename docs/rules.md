# Rules: Coding Standards & Development Guidelines

## Project Philosophy

**Core Principle**: This is a healthcare application where safety, privacy, and reliability are non-negotiable. Every line of code must prioritize patient safety above all else.

---

## Safety Rules (CRITICAL - NEVER VIOLATE)

### 1. Non-Diagnostic Enforcement
- **Rule**: The system must NEVER output a diagnosis, prescription, or treatment recommendation
- **Implementation**:
  - All LLM prompts must explicitly state "You are organizing information, NOT diagnosing"
  - Add disclaimer banners on every screen: "This is a triage support tool. Only qualified medical professionals can diagnose and prescribe treatment."
  - Hard-coded guardrails in prompt engineering to prevent diagnostic language
  - Post-processing filter to block terms like "diagnosis", "prescribe", "treatment", "cure"

### 2. Medical Responsibility
- **Rule**: Always defer to qualified medical professionals
- **Implementation**:
  - All outputs must be framed as "suggested questions for doctor" or "information to review"
  - Never claim medical authority
  - Include human escalation paths for all urgency levels
  - Require doctor confirmation before any referral generation

### 3. Critical Rule Overrides
- **Rule**: Deterministic clinical rules (ICMR protocols) always override LLM suggestions
- **Implementation**:
  - Rule engine runs BEFORE LLM
  - Critical vitals (SpO2 < 90%, BP > 180) force RED urgency regardless of LLM output
  - LLM cannot downgrade urgency from rule-based determinations
  - Rules are version-controlled and auditable

---

## Privacy Rules (CRITICAL - NEVER VIOLATE)

### 1. PII Protection
- **Rule**: Personally Identifiable Information (PII) must be anonymized before any cloud processing
- **Implementation**:
  - Run PII detection (Aadhaar, phone, name, address) on ALL inputs
  - Redact with placeholders (<AADHAAR_RED>, <PHONE_RED>, <NAME_RED>)
  - Store original PII in encrypted local vault only
  - Never log PII in plain text
  - Enable PII detection by default; no opt-out

### 2. Consent First
- **Rule**: No data collection without explicit, recorded consent
- **Implementation**:
  - Interactive consent screen before any data collection
  - Separate consent for: voice recording, document upload, AI processing, data storage
  - Timestamp and log all consent events
  - Allow consent withdrawal
  - Clear language in vernacular (Hindi, Odia, etc.)

### 3. Data Retention
- **Rule**: Minimize data retention; automatic deletion after X days
- **Implementation**:
  - Configurable retention policy (default: 30 days)
  - Automated cleanup jobs
  - Audit log of all deletions
  - Secure deletion (overwrite, not just delete)

### 4. Access Control
- **Rule**: Role-based access control (RBAC) for all data access
- **Implementation**:
  - Define roles: ASHA Worker, Nurse, Medical Officer, Admin
  - JWT tokens with role claims
  - API-level authorization middleware
  - Audit all data access events

---

## Coding Standards

### Python (Backend)

#### File Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── consent.py
│   │   │   ├── patient.py
│   │   │   ├── triage.py
│   │   │   └── ai_chat.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── security.py
│   │   └── privacy.py
│   ├── engines/
│   │   ├── rule_engine.py
│   │   ├── llm_engine.py
│   │   └── ocr_engine.py
│   ├── models/
│   │   ├── user.py
│   │   ├── consent.py
│   │   ├── patient.py
│   │   └── triage.py
│   └── services/
│       ├── consent_service.py
│       ├── pii_service.py
│       └── audit_service.py
├── tests/
└── main.py
```

#### Code Style
- Follow PEP 8
- Use type hints for all function signatures
- Maximum line length: 100 characters
- Use snake_case for variables and functions
- Use PascalCase for classes
- Docstrings for all public functions (Google style)

#### Example
```python
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class PatientVitals(BaseModel):
    """Patient vital signs with validation."""
    spo2: float = Field(..., ge=0, le=100, description="Oxygen saturation %")
    systolic_bp: Optional[int] = Field(None, ge=0, le=300, description="Systolic BP mmHg")
    diastolic_bp: Optional[int] = Field(None, ge=0, le=200, description="Diastolic BP mmHg")
    temperature: Optional[float] = Field(None, ge=30, le=45, description="Temperature °C")

def assess_urgency(vitals: PatientVitals) -> str:
    """
    Assess patient urgency based on vital signs using ICMR protocols.

    Args:
        vitals: Patient vital signs

    Returns:
        Urgency level: "RED", "AMBER", or "GREEN"

    Raises:
        ValueError: If vitals are invalid
    """
    if vitals.spo2 < 90:
        return "RED"
    if vitals.systolic_bp and vitals.systolic_bp > 180:
        return "RED"
    return "GREEN"
```

#### Error Handling
- Use custom exceptions for business logic errors
- Never expose stack traces to clients
- Log all errors with context
- Return structured error responses

```python
class TriageError(Exception):
    """Base exception for triage-related errors."""
    pass

class CriticalVitalsError(TriageError):
    """Raised when critical vitals are detected."""
    pass

try:
    urgency = assess_urgency(vitals)
    if urgency == "RED":
        raise CriticalVitalsError("Immediate medical attention required")
except TriageError as e:
    logger.error(f"Triage assessment failed: {e}")
    raise HTTPException(status_code=400, detail=str(e))
```

#### Testing
- Unit tests for all business logic
- Integration tests for API endpoints
- Minimum 80% code coverage
- Test critical rule engine paths exhaustively

```python
import pytest
from app.engines.rule_engine import assess_urgency
from app.models.patient import PatientVitals

def test_critical_spo2_forces_red():
    """Test that SpO2 < 90% forces RED urgency."""
    vitals = PatientVitals(spo2=88)
    assert assess_urgency(vitals) == "RED"

def test_normal_vitals_green():
    """Test that normal vitals result in GREEN urgency."""
    vitals = PatientVitals(spo2=98, systolic_bp=120, diastolic_bp=80)
    assert assess_urgency(vitals) == "GREEN"
```

---

### TypeScript/JavaScript (Frontend)

#### File Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── consent/
│   │   ├── (dashboard)/
│   │   │   ├── queue/
│   │   │   ├── patient/
│   │   │   └── review/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── intake/
│   │   │   └── dashboard/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── privacy.ts
│   │   │   └── storage.ts
│   │   └── store/
│   │       └── useStore.ts
│   └── types/
├── public/
└── tests/
```

#### Code Style
- Use TypeScript strict mode
- Use functional components with hooks
- Prefer server components over client components
- Use TailwindCSS for styling
- Maximum line length: 100 characters
- Use camelCase for variables and functions
- Use PascalCase for components

#### Example
```typescript
import { useState, useEffect } from 'react';
import { PatientVitals } from '@/types/patient';
import { assessUrgency } from '@/lib/api';

interface VitalInputProps {
  onSubmit: (vitals: PatientVitals) => void;
}

export default function VitalInput({ onSubmit }: VitalInputProps) {
  const [spo2, setSpo2] = useState<number>(98);
  const [urgency, setUrgency] = useState<'RED' | 'AMBER' | 'GREEN'>('GREEN');

  useEffect(() => {
    const vitals: PatientVitals = { spo2 };
    const result = assessUrgency(vitals);
    setUrgency(result);
  }, [spo2]);

  return (
    <div className="p-4 border rounded-lg">
      <label className="block mb-2">SpO2 (%)</label>
      <input
        type="number"
        value={spo2}
        onChange={(e) => setSpo2(Number(e.target.value))}
        className="w-full p-2 border rounded"
        min={0}
        max={100}
      />
      <div className={`mt-2 p-2 rounded ${
        urgency === 'RED' ? 'bg-red-100 text-red-800' :
        urgency === 'AMBER' ? 'bg-yellow-100 text-yellow-800' :
        'bg-green-100 text-green-800'
      }`}>
        Urgency: {urgency}
      </div>
    </div>
  );
}
```

#### Error Handling
- Use error boundaries for React errors
- Show user-friendly error messages
- Log errors to monitoring service
- Implement retry logic for API calls

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-800 font-bold">Something went wrong</h2>
      <p className="text-red-600">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
      >
        Reload Page
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

#### Testing
- Unit tests for utility functions
- Component tests with React Testing Library
- E2E tests with Playwright
- Test critical user flows (consent, triage, review)

---

## API Design Rules

### RESTful Conventions
- Use HTTP verbs correctly (GET, POST, PUT, DELETE)
- Use plural nouns for resources (/patients, /triage-notes)
- Use kebab-case for query parameters
- Return standard HTTP status codes
- Use JSON for request/response bodies

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-10-07T10:30:00Z",
    "request_id": "req_12345"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid vital signs provided",
    "details": {
      "spo2": ["Must be between 0 and 100"]
    }
  },
  "meta": {
    "timestamp": "2026-10-07T10:30:00Z",
    "request_id": "req_12345"
  }
}
```

### Authentication
- All endpoints except /auth/* require JWT token
- Include token in Authorization header: `Bearer <token>`
- Token expiry: 1 hour (refresh token: 7 days)
- Role-based access control on protected endpoints

---

## Database Rules

### Schema Design
- Use foreign keys for relationships
- Add indexes on frequently queried columns
- Use timestamp columns (created_at, updated_at)
- Soft delete with deleted_at column
- Encrypt sensitive columns (PII)

### Naming Conventions
- Tables: snake_case (patients, triage_notes)
- Columns: snake_case (patient_id, created_at)
- Primary keys: id (UUID)
- Foreign keys: <table>_id (patient_id)

### Example Schema
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anonymous_id VARCHAR(50) UNIQUE NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE triage_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    urgency VARCHAR(10) NOT NULL, -- RED, AMBER, GREEN
    chief_complaint TEXT,
    vitals JSONB,
    lab_results JSONB,
    urgency_signals TEXT[],
    missing_info TEXT[],
    suggested_questions TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_triage_urgency ON triage_notes(urgency);
CREATE INDEX idx_triage_created ON triage_notes(created_at DESC);
```

---

## Security Rules

### 1. Input Validation
- Validate all inputs on both client and server
- Use Pydantic models for validation
- Sanitize all user inputs
- Parameterize all database queries

### 2. Output Encoding
- Encode all dynamic content in HTML
- Use React's built-in XSS protection
- Set Content-Security-Policy headers
- Escape all template literals

### 3. Secret Management
- Never commit secrets to git
- Use environment variables for secrets
- Rotate API keys regularly
- Use secret scanning in CI/CD

### 4. Dependency Management
- Use lock files (package-lock.json, requirements.txt)
- Regular dependency updates
- Use Snyk or similar for vulnerability scanning
- Review security advisories

---

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `hotfix/*`: Urgent production fixes

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Example:
```
feat(triage): add bounding box highlight for lab values

- Implement canvas overlay on document viewer
- Store bounding box coordinates in database
- Add click-to-jump to source functionality

Closes #123
```

### Pull Request Requirements
- All tests must pass
- Code review approval required
- No merge conflicts
- Updated documentation if needed
- Security review for sensitive changes

---

## Documentation Rules

### Code Documentation
- Docstrings for all public functions
- Inline comments for complex logic
- README for each major module
- API documentation (OpenAPI/Swagger)

### Project Documentation
- Keep architecture.md updated
- Document all dependencies
- Maintain changelog
- Record architectural decisions

---

## Performance Rules

### Optimization Guidelines
- Lazy load images and components
- Debounce user inputs (voice, text)
- Cache LLM responses for similar cases
- Use Web Workers for heavy processing (OCR)
- Compress images before upload

### Performance Targets
- Page load: <2 seconds
- API response: <500ms (p95)
- Voice-to-text: <3 seconds
- OCR processing: <5 seconds per page
- Triage generation: <10 seconds

---

## Accessibility Rules

### WCAG 2.1 Compliance
- All images have alt text
- Keyboard navigation support
- Color contrast ratio ≥4.5:1
- Screen reader compatible
- Error messages are descriptive

### Vernacular Support
- UI available in Hindi, Odia, Bengali, Telugu
- Voice input in regional languages
- Clear, simple language
- Avoid medical jargon
- Visual icons for literacy support

---

## Testing Rules

### Test Coverage
- Minimum 80% code coverage
- 100% coverage for critical rule engine
- Integration tests for all API endpoints
- E2E tests for critical user flows

### Test Categories
1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API and database interactions
3. **E2E Tests**: Complete user workflows
4. **Security Tests**: PII detection, access control
5. **Performance Tests**: Load and stress testing

### Critical Test Paths
- Critical vitals → RED urgency
- PII detection and redaction
- Consent recording and verification
- Offline sync functionality
- Rule engine override of LLM

---

## Deployment Rules

### Environment Configuration
- Separate configs for dev, staging, prod
- Never use production secrets in dev
- Use environment-specific feature flags
- Validate config on startup

### CI/CD Pipeline
- Automated tests on every commit
- Security scanning before deployment
- Staging deployment before production
- Rollback capability
- Blue-green deployment for zero downtime

### Monitoring
- Log all errors and warnings
- Track critical metrics (latency, uptime)
- Set up alerts for failures
- Regular health checks
- Performance monitoring

---

## Code Review Checklist

Before merging code, verify:
- [ ] No diagnostic language in outputs
- [ ] PII anonymization implemented
- [ ] Consent flow included
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No hardcoded secrets
- [ ] Error handling robust
- [ ] Performance acceptable
- [ ] Accessibility verified
- [ ] Security reviewed

---

## Violation Consequences

### Critical Violations (Safety/Privacy)
- Immediate rollback
- Root cause analysis required
- Team retraining if needed
- Process improvement plan

### Standard Violations (Code Style/Best Practices)
- Fix in follow-up commit
- Document the issue
- Update guidelines if needed

---

## Continuous Improvement

### Regular Reviews
- Monthly security audit
- Quarterly performance review
- Bi-annual accessibility audit
- Annual architecture review

### Feedback Loop
- Collect user feedback from PHCs
- Monitor error rates and patterns
- Track success metrics
- Iterate based on real-world usage

---

## Remember

> "This system will never diagnose a patient. It will make sure the person who can, has everything they need in ninety seconds."

Every line of code should serve this mission. Safety first, always.
