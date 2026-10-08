# Design: UI/UX & Component Design

## Design Philosophy

**Core Principles**:
- **Simplicity First**: Designed for ASHA workers and nurses with minimal technical training
- **90-Second Rule**: Doctors must review a patient in under 90 seconds
- **India-First**: Works on low-end devices, slow internet, and regional languages
- **Accessibility First**: WCAG 2.1 AA compliant, vernacular support, visual cues

---

## Color Palette

### Primary Colors
```css
--primary-blue: #2563EB;      /* Action buttons, links */
--primary-dark: #1E40AF;      /* Hover states */
--primary-light: #3B82F6;      /* Secondary actions */
```

### Urgency Colors (Cognizant Evaluation Focus)
```css
--urgency-red: #DC2626;       /* Critical - Immediate attention */
--urgency-red-bg: #FEF2F2;    /* Red background */
--urgency-amber: #D97706;     /* Warning - Prioritize */
--urgency-amber-bg: #FFFBEB;  /* Amber background */
--urgency-green: #059669;      /* Routine - Normal queue */
--urgency-green-bg: #ECFDF5;  /* Green background */
```

### Neutral Colors
```css
--gray-50: #F9FAFB;           /* Backgrounds */
--gray-100: #F3F4F6;          /* Cards */
--gray-200: #E5E7EB;          /* Borders */
--gray-500: #6B7280;          /* Secondary text */
--gray-800: #1F2937;          /* Primary text */
--gray-900: #111827;          /* Headings */
```

### Semantic Colors
```css
--success: #10B981;           /* Success states */
--warning: #F59E0B;           /* Warnings */
--error: #EF4444;             /* Errors */
--info: #3B82F6;              /* Information */
```

---

## Typography

### Font Family
```css
--font-sans: 'Inter', 'Hindi', 'Odia', system-ui, sans-serif;
--font-mono: 'Fira Code', monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;   /* 12px - Labels, captions */
--text-sm: 0.875rem;  /* 14px - Body text */
--text-base: 1rem;    /* 16px - Default */
--text-lg: 1.125rem;  /* 18px - Subheadings */
--text-xl: 1.25rem;   /* 20px - Headings */
--text-2xl: 1.5rem;   /* 24px - Page titles */
--text-3xl: 1.875rem; /* 30px - Hero text */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Component Library

### 1. Buttons

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Submit Triage
</Button>
```
- Background: Primary blue
- Hover: Darker blue
- Active: Pressed state
- Focus: Blue ring

#### Urgency Buttons
```tsx
<Button variant="urgency-red">Critical Alert</Button>
<Button variant="urgency-amber">Warning</Button>
<Button variant="urgency-green">Routine</Button>
```

#### Icon Button
```tsx
<IconButton icon={<MicIcon />} aria-label="Start voice input" />
```

#### Loading Button
```tsx
<Button loading={true} disabled>
  Processing...
</Button>
```

---

### 2. Cards

#### Patient Card
```tsx
<PatientCard
  patientId="P-001"
  urgency="RED"
  waitTime={2}
  summary="SpO2 88%, severe dyspnea"
  onReview={() => handleReview(patientId)}
/>
```

**Visual Design**:
- Left border colored by urgency (red/amber/green)
- Patient ID and urgency badge
- Wait time in minutes
- One-line summary
- "Review Now" button

#### Triage Note Card
```tsx
<TriageNoteCard
  urgency="RED"
  chiefComplaint="Severe breathing difficulty for 2 days"
  vitals={{ spo2: 88, bp: "140/90" }}
  urgencySignals={["SpO2 < 90%", "Severe dyspnea"]}
  missingInfo={["Temperature not recorded"]}
  suggestedQuestions={["Any chest pain?", "History of asthma?"]}
/>
```

---

### 3. Input Components

#### Voice Input
```tsx
<VoiceInput
  language="hi"
  onTranscript={(text) => setSymptoms(text)}
  onError={(error) => showError(error)}
/>
```

**Visual Design**:
- Large microphone button (centered)
- Pulsing animation when recording
- Real-time transcript display
- Language selector dropdown
- Confidence score indicator
- "Stop Recording" button

#### Multi-language Text Input
```tsx
<TextInput
  label="Describe symptoms"
  language="hi"
  placeholder="अपने लक्षण बताएं..."
  value={symptoms}
  onChange={setSymptoms}
  maxLength={500}
  showCharCount
/>
```

#### Vital Signs Input
```tsx
<VitalsInput
  fields={[
    { name: "spo2", label: "SpO2 (%)", min: 0, max: 100, required: true },
    { name: "temperature", label: "Temperature (°C)", min: 30, max: 45 },
    { name: "systolic_bp", label: "Systolic BP (mmHg)", min: 0, max: 300 },
    { name: "diastolic_bp", label: "Diastolic BP (mmHg)", min: 0, max: 200 },
  ]}
  onChange={setVitals}
  showUrgencyIndicator
/>
```

**Visual Design**:
- Grid layout (2x2 on desktop, 1x4 on mobile)
- Real-time urgency indicator (color changes based on values)
- Validation errors inline
- Reference ranges displayed

#### Document Upload
```tsx
<DocumentUpload
  accept=".pdf,.jpg,.png"
  maxSize={10}
  onUpload={handleUpload}
  onOCRComplete={handleOCRResult}
  showProgress
/>
```

**Visual Design**:
- Drag and drop zone
- File type icons
- Progress bar during upload
- OCR progress indicator
- Thumbnail preview

---

### 4. Display Components

#### Document Viewer with Highlights
```tsx
<DocumentViewer
  document={labReport}
  highlights={[
    { value: "6.8", box: { x1: 100, y1: 200, x2: 150, y2: 220 }, color: "red" }
  ]}
  onHighlightClick={(value) => showDetails(value)}
/>
```

**Visual Design**:
- Original document image
- Overlay canvas for highlights
- Bounding boxes with colored borders
- Hover effect on highlights
- Click to show details tooltip

#### Lab Results Table
```tsx
<LabResultsTable
  results={[
    { test: "Hemoglobin", value: "6.8", unit: "g/dL", reference: "12.0-16.0", abnormal: true },
    { test: "Platelets", value: "45000", unit: "/μL", reference: "150000-400000", abnormal: true },
  ]}
  onRowClick={(test) => showBoundingbox(test)}
/>
```

**Visual Design**:
- Table with test name, value, unit, reference
- Abnormal values highlighted in red
- Hover effect shows bounding box
- Sortable columns

#### Vitals Visualization
```tsx
<VitalsChart
  data={[
    { timestamp: "10:00", spo2: 88, bp: "140/90" },
    { timestamp: "10:30", spo2: 90, bp: "135/85" },
  ]}
  type="line"
/>
```

---

### 5. Layout Components

#### Consent Screen
```tsx
<ConsentScreen
  consentTypes={[
    { id: "voice", label: "Voice Recording", description: "Record your voice for symptom input" },
    { id: "document", label: "Document Upload", description: "Upload lab reports and medical documents" },
    { id: "ai", label: "AI Processing", description: "Use AI to extract and summarize information" },
  ]}
  onConsent={(types) => startIntake(types)}
/>
```

**Visual Design**:
- Full-screen modal
- Clear language (vernacular)
- Checkbox for each consent type
- Audio recording for voice consent
- "I Agree" button (disabled until all consents)
- Privacy policy link

#### Queue Board
```tsx
<QueueBoard
  patients={patientQueue}
  sortBy="urgency"
  filters={{ urgency: ["RED", "AMBER", "GREEN"] }}
  onPatientSelect={handlePatientSelect}
/>
```

**Visual Design**:
- Card-based layout
- Color-coded by urgency
- Auto-sort (RED first)
- Wait time badge
- Filter dropdown
- Search bar
- Bulk action buttons

#### Doctor Dashboard
```tsx
<DoctorDashboard
  queue={patientQueue}
  stats={{
    total: 45,
    red: 5,
    amber: 12,
    green: 28,
    avgWaitTime: 15,
  }}
  currentPatient={selectedPatient}
/>
```

**Visual Design**:
- Left sidebar: Queue board
- Center: Patient details
- Right: Actions panel
- Top: Statistics bar
- Responsive: Collapsible sidebar on mobile

---

### 6. Feedback Components

#### Toast Notifications
```tsx
<Toast
  type="success"
  message="Triage note generated successfully"
  duration={3000}
  onClose={() => {}}
/>
```

**Visual Design**:
- Top-right position
- Slide-in animation
- Color-coded by type
- Auto-dismiss after 3 seconds
- Close button

#### Error Boundary
```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <PatientIntake />
</ErrorBoundary>
```

**ErrorFallback**:
- Friendly error message
- "Reload Page" button
- "Report Issue" link
- Error details (collapsed)

#### Loading States
```tsx
<Skeleton variant="card" count={3} />
<Skeleton variant="text" lines={3} />
<Skeleton variant="circle" size={40} />
```

**Visual Design**:
- Gray placeholder
- Shimmer animation
- Matches component shape

---

### 7. Privacy Components

#### PII Detection Banner
```tsx
<PIIBanner
  detected={["Aadhaar number", "Phone number"]}
  onAnonymize={handleAnonymize}
/>
```

**Visual Design**:
- Yellow warning banner
- List of detected PII types
- "Anonymize Now" button
- Auto-anonymize option

#### Consent Recorder
```tsx
<ConsentRecorder
  type="voice"
  onRecord={handleConsent}
  maxDuration={30}
/>
```

**Visual Design**:
- Microphone button
- Recording timer
- Waveform visualization
- Playback option
- "Re-record" button

---

## Screen Designs

### Screen 1: Login
```
┌─────────────────────────────────────────────┐
│              HEALTH TRIAGE AI              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Username                           │   │
│  │  [_____________________________]   │   │
│  │                                     │   │
│  │  Password                           │   │
│  │  [_____________________________]   │   │
│  │                                     │   │
│  │  [        Login        ]  [ Forgot ]│   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Role: Nurse ▼                              │
│                                             │
│  Language: English ▼                        │
└─────────────────────────────────────────────┘
```

### Screen 2: Consent
```
┌─────────────────────────────────────────────┐
│          CONSENT TO COLLECT DATA           │
│                                             │
│  We need your permission to:               │
│                                             │
│  ☑ Record your voice                       │
│     For symptom input in your language     │
│                                             │
│  ☑ Upload documents                        │
│     Lab reports, medical records           │
│                                             │
│  ☑ Use AI to process data                  │
│     Extract and summarize information       │
│                                             │
│  ☑ Store data for 30 days                  │
│     For quality improvement                │
│                                             │
│  [ Privacy Policy ]  [ Learn More ]        │
│                                             │
│  [       I AGREE (Voice or Touch)        ] │
└─────────────────────────────────────────────┘
```

### Screen 3: Patient Intake
```
┌─────────────────────────────────────────────┐
│         NEW PATIENT TRIAGE          [Back] │
├─────────────────────────────────────────────┤
│                                             │
│  1. Describe Symptoms                      │
│                                             │
│     [ 🎤 Speak ]  [ ✏️ Type ]              │
│                                             │
│     "बुखार 5 दिन से है, सांस लेने में तकलीफ"│
│                                             │
│     Confidence: 92% ▲                       │
│                                             │
│  2. Upload Lab Reports                     │
│                                             │
│     [ 📄 Upload PDF or Image ]             │
│                                             │
│     Uploaded: CBC_Report.pdf ✓              │
│                                             │
│  3. Record Vitals                           │
│                                             │
│     SpO2:   [ 88 ] %   ⚠️ RED              │
│     Temp:   [ 38.5 ] °C                     │
│     BP:     [ 140 ] / [ 90 ] mmHg          │
│                                             │
│  [       Generate Triage Note       ]      │
└─────────────────────────────────────────────┘
```

### Screen 4: Triage Result
```
┌─────────────────────────────────────────────┐
│         TRIAGE NOTE: P-001        [ RED ]   │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ URGENT - IMMEDIATE ATTENTION REQUIRED   │
│                                             │
│  CHIEF COMPLAINT:                           │
│  Fever for 5 days with severe breathing     │
│  difficulty                                  │
│                                             │
│  VITALS & LAB ALERTS:                       │
│  • SpO2: 88% (Critical: <90%) ⚠️           │
│  • Temperature: 38.5°C (Fever)             │
│  • Hemoglobin: 6.8 g/dL (Low: <12.0) ⚠️     │
│                                             │
│  URGENCY SIGNALS:                           │
│  • SpO2 below critical threshold            │
│  • Severe dyspnea reported                  │
│  • Severe anemia detected                   │
│                                             │
│  MISSING INFORMATION:                       │
│  • Blood pressure not recorded              │
│  • Previous hemoglobin levels unknown       │
│                                             │
│  SUGGESTED QUESTIONS FOR DOCTOR:            │
│  1. Any chest pain or discomfort?           │
│  2. History of asthma or COPD?              │
│  3. Any recent travel or exposure?          │
│  4. Bleeding symptoms?                      │
│                                             │
│  [ View Source Docs ]  [ Add to Queue ]     │
└─────────────────────────────────────────────┘
```

### Screen 5: Doctor Queue
```
┌─────────────────────────────────────────────┐
│  DOCTOR QUEUE              Total: 45        │
├─────────────────────────────────────────────┤
│  🔴 RED (5)  🟡 AMBER (12)  🟢 GREEN (28)   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔴 P-001  | 2 min  | SpO2 88% [View]│   │
│  │ 🔴 P-002  | 5 min  | BP 190/... [View]│   │
│  │ 🟡 P-003  | 12 min | Hb 6.8... [View]│   │
│  │ 🟢 P-004  | 25 min | Routine [View] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [ Filter: All ▼ ]  [ Search: ___ ]       │
└─────────────────────────────────────────────┘
```

### Screen 6: Patient Review
```
┌─────────────────────────────────────────────┐
│  PATIENT REVIEW: P-001        [ RED ]       │
├─────────────────────────────────────────────┤
│                                             │
│  CHIEF COMPLAINT:                           │
│  Fever for 5 days with severe breathing     │
│  difficulty                                  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ LAB REPORT (CBC)                   │   │
│  │ ┌───────────────────────────────┐   │   │
│  │ │ Hemoglobin: [6.8] g/dL ⚠️    │   │   │
│  │ │ Reference: 12.0-16.0 g/dL      │   │   │
│  │ └───────────────────────────────┘   │   │
│  │ (Click to view full report)          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SUGGESTED QUESTIONS:                       │
│  ☐ Any chest pain?                          │
│  ☐ History of asthma?                       │
│  ☐ Recent travel?                           │
│                                             │
│  ACTIONS:                                   │
│  [ 📋 Generate Referral ]                   │
│  [ ✅ Admit ]  [ ➡️ Refer ]  [ 🏠 Discharge]│
└─────────────────────────────────────────────┘
```

### Screen 7: Referral Note
```
┌─────────────────────────────────────────────┐
│         ABDM REFERRAL NOTE                  │
├─────────────────────────────────────────────┤
│                                             │
│  Patient ID: P-001                          │
│  Facility: PHC-Block-X                       │
│  Date: 2026-10-07                           │
│                                             │
│  REFERRAL REASON:                           │
│  Critical hypoxemia (SpO2 88%) with severe   │
│  dyspnea. Suspected respiratory emergency.  │
│                                             │
│  FINDINGS:                                  │
│  • SpO2: 88% (Critical)                     │
│  • Temperature: 38.5°C                      │
│  • Hemoglobin: 6.8 g/dL (Severe anemia)     │
│                                             │
│  URGENCY: RED - IMMEDIATE                   │
│                                             │
│  SUGGESTED SPECIALIST:                       │
│  Pulmonologist / Emergency Medicine         │
│                                             │
│  Referring Officer: Dr. Sharma              │
│  Signature: [_________________]             │
│                                             │
│  [ 📄 Download PDF ]  [ 📋 Copy Text ]      │
└─────────────────────────────────────────────┘
```

---

## Responsive Design

### Breakpoints
```css
--mobile: 640px;    /* Small phones */
--tablet: 768px;    /* Tablets */
--laptop: 1024px;   /* Laptops */
--desktop: 1280px;  /* Desktops */
```

### Mobile-First Strategy
- Design for mobile first (375px base)
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Simplified navigation (hamburger menu)
- Stacked layouts on mobile

### Desktop Enhancements
- Multi-column layouts
- Hover states
- Keyboard shortcuts
- Advanced filters
- Side-by-side document view

---

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratio ≥4.5:1 for text
- Color contrast ratio ≥3:1 for UI components
- All interactive elements keyboard accessible
- Focus indicators visible
- ARIA labels for screen readers
- Skip to main content link
- Alt text for all images
- Form labels associated with inputs

### Screen Reader Support
- Semantic HTML (nav, main, section)
- ARIA landmarks
- Live regions for dynamic content
- Descriptive link text
- Error announcements

### Keyboard Navigation
- Tab order logical
- Enter/Space for buttons
- Escape to close modals
- Arrow keys for lists
- Focus traps in modals

---

## Animation Guidelines

### Principles
- Purposeful: Animations must serve a function
- Subtle: No distracting or jarring effects
- Performant: 60fps on low-end devices
- Respectable: Honor reduced motion preference

### Animations
- Fade in: 300ms ease-out
- Slide in: 300ms ease-out
- Scale: 200ms ease-out
- Pulse: 2s infinite (recording indicator)
- Shimmer: 1.5s infinite (loading)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Icon System

### Icon Library
- Lucide React (lightweight, consistent)
- Custom icons for medical symbols
- SVG format for scalability

### Icon Usage
- 24x24px default size
- Stroke width: 2px
- Color: inherit or semantic colors
- Always include aria-label

### Key Icons
- 🎤 Microphone (voice input)
- 📄 Document (upload)
- 🔴 Red/🟡 Amber/🟢 Green (urgency)
- ⚠️ Warning (alerts)
- ✅ Check (success)
- ❌ Cross (error)
- 🔍 Search (search)
- 📋 Clipboard (notes)
- ➡️ Arrow (navigation)

---

## Dark Mode Support

### Color Adaptation
```css
@media (prefers-color-scheme: dark) {
  --gray-50: #111827;
  --gray-100: #1F2937;
  --gray-200: #374151;
  --gray-500: #9CA3AF;
  --gray-800: #F3F4F6;
  --gray-900: #F9FAFB;
}
```

### Considerations
- High contrast maintained
- Urgency colors unchanged (critical for safety)
- Reduced eye strain
- Automatic system preference detection

---

## Performance Guidelines

### Optimization
- Lazy load images
- Code splitting by route
- Tree-shake unused components
- Compress assets
- Use WebP for images
- Minify CSS/JS

### Bundle Size Targets
- Initial load: <200KB
- Route chunks: <100KB each
- Total bundle: <500KB

---

## Internationalization (i18n)

### Supported Languages
- English (en)
- Hindi (hi)
- Odia (or)
- Bengali (bn)
- Telugu (te)
- Tamil (ta)

### Implementation
- JSON language files
- Key-based translation
- RTL support (future)
- Date/time localization
- Number formatting

### Example
```json
{
  "en": {
    "symptoms.label": "Describe symptoms",
    "urgency.red": "Critical"
  },
  "hi": {
    "symptoms.label": "लक्षण बताएं",
    "urgency.red": "गंभीर"
  }
}
```

---

## Component Props Documentation

### Button Component
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'urgency-red' | 'urgency-amber' | 'urgency-green';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### PatientCard Component
```tsx
interface PatientCardProps {
  patientId: string;
  urgency: 'RED' | 'AMBER' | 'GREEN';
  waitTime: number;
  summary: string;
  onReview: (id: string) => void;
}
```

### VoiceInput Component
```tsx
interface VoiceInputProps {
  language: string;
  onTranscript: (text: string) => void;
  onError: (error: Error) => void;
  maxLength?: number;
}
```

### AIChatBot Component
```tsx
interface AIChatBotProps {
  initialLanguage?: string;
  patientContext?: {
    name?: string;
    age?: string;
    gender?: string;
    symptoms?: string;
    vitals?: Record<string, any>;
  };
  onPrescriptionGenerated?: (rxData: PrescriptionResponse) => void;
}
```

**UI Structure**:
- Header: Doctor avatar, online status, language selector (7 Indian languages), voice toggle controls.
- Message Feed: Bubble layout (doctor: warm slate/white with avatar; patient: primary blue with user badge).
- Action Bar: STT mic button with pulsing recording animation, text input field, send button.
- Bottom Tooling: One-click "Get Official Prescription / Rx Slip" button when consultation reaches supportive conclusions.

### PrescriptionModal Component
```tsx
interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: PrescriptionResponse;
  onPrint?: () => void;
}
```

**UI Structure**:
- Official PHC / CHC Digital Header with Government of India health emblem and Rx ID badge.
- Patient Demographics & Date Grid.
- Clinical Findings & Symptoms Summary.
- Structured Medicines Table (Medicine Name, Type, Dosage, Frequency, Timing, Duration, Instructions, Precautions).
- Home Care, Supportive Dietary Advice & Red-Flag Warnings.
- Print / Save as PDF button for pharmacy purchase.

---

## Design Tokens

### Spacing
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

### Border Radius
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

---

## Design System Tools

### Figma
- Component library
- Design tokens
- Prototypes
- Handoff documentation

### Storybook
- Component documentation
- Interactive examples
- Accessibility testing
- Visual regression testing

### ZeroHeight
- Design guidelines
- Brand assets
- Icon library
- Typography scale

---

## Usability Testing

### Test Scenarios
1. ASHA worker collecting patient data (no technical background)
2. Nurse reviewing queue (high stress, time pressure)
3. Doctor reviewing patient (90-second rule)
4. Offline mode (no internet)
5. Regional language user (Hindi/Odia)

### Success Criteria
- Task completion rate: >90%
- Time to complete triage: <5 minutes
- Error rate: <5%
- User satisfaction: >4/5

---

## Remember

> "Design for the user who has never used a computer before, in a language they speak, on a device they can afford, in a place with no internet."

Every design decision should serve this mission. Accessibility first, always.
