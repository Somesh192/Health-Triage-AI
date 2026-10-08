# Setup Guide: Multimodal Healthcare Triage Assistant

This guide will help you set up the development environment for the Multimodal Healthcare Triage Assistant project.

---

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` (should be v18+)
   - Verify: `npm --version` (should be 9+)

2. **Python** (v3.11 or higher)
   - Download: https://www.python.org/downloads/
   - During installation, check "Add Python to PATH"
   - Verify: `python --version` (should be 3.11+)
   - Verify: `pip --version`

3. **Git**
   - Download: https://git-scm.com/downloads
   - Verify: `git --version`

4. **Ollama** (for local LLM)
   - Download: https://ollama.ai/download
   - After installation, run: `ollama pull llama3.2:3b`
   - Verify: `ollama list`

5. **VS Code** (recommended IDE)
   - Download: https://code.visualstudio.com/
   - Recommended extensions:
     - Python (Microsoft)
     - ESLint
     - Prettier
     - Tailwind CSS IntelliSense

### Optional but Recommended

1. **PaddleOCR Dependencies** (for document OCR)
   - For Windows: Install Visual C++ Redistributable
   - For Linux: `sudo apt-get install libgomp1`
   - For macOS: Usually pre-installed with Xcode

2. **Tesseract OCR** (fallback OCR)
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr`
   - macOS: `brew install tesseract`

---

## Project Structure

```
Health Ai/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Config, security
│   │   ├── engines/        # Rule engine, LLM, OCR
│   │   ├── models/         # Database models
│   │   └── services/       # Business logic
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── main.py             # FastAPI entry point
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities
│   │   └── store/          # State management
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── next.config.js      # Next.js config
├── docs/                   # Documentation
├── .env.example           # Environment variables template
└── README.md              # Project README
```

---

## Installation Steps

### Step 1: Clone the Repository

```bash
cd "D:\bput hackthoon"
git init
git add .
git commit -m "Initial commit with documentation"
```

### Step 2: Set Up Backend (FastAPI)

#### 2.1 Create Backend Directory Structure

```bash
cd "D:\bput hackthoon\Health Ai"
mkdir backend
cd backend
mkdir -p app/api/routes app/core app/engines app/models app/services tests
```

#### 2.2 Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install Python Dependencies

Create `backend/requirements.txt`:

```txt
# FastAPI and Server
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.23
alembic==1.12.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# AI/ML
paddleocr==2.7.0.3
paddlepaddle==2.5.2
spacy==3.7.2
openai==1.3.7
langchain==0.0.335
langchain-community==0.0.1

# OCR
pillow==10.1.0
pdf2image==1.16.3
pytesseract==0.3.10

# Utilities
python-dotenv==1.0.0
httpx==0.25.2
aiofiles==23.2.1

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
```

Install dependencies:
```bash
pip install -r requirements.txt
```

#### 2.4 Download spaCy Model

```bash
python -m spacy download en_core_web_sm
```

#### 2.5 Verify Backend Setup

Create a test file `backend/test_setup.py`:

```python
import fastapi
import sqlalchemy
import spacy

print("✅ FastAPI:", fastapi.__version__)
print("✅ SQLAlchemy:", sqlalchemy.__version__)
print("✅ spaCy:", spacy.__version__)
```

Run:
```bash
python test_setup.py
```

---

### Step 3: Set Up Frontend (Next.js)

#### 3.1 Create Next.js Project

```bash
cd "D:\bput hackthoon\Health Ai"
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Answer the prompts:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: `@/*`

#### 3.2 Install Additional Frontend Dependencies

```bash
cd frontend
npm install zustand dexie clsx tailwind-merge lucide-react class-variance-authority
npm install -D @types/node
```

#### 3.3 Install PWA Support

```bash
npm install next-pwa
```

#### 3.4 Verify Frontend Setup

```bash
npm run dev
```

Visit http://localhost:3000 - you should see the Next.js welcome page.

---

### Step 4: Configure Environment Variables

Create `.env` file in the project root:

```bash
cd "D:\bput hackthoon\Health Ai"
```

Copy the contents from `.env.example` (created in next step) to `.env` and fill in your values.

---

### Step 5: Set Up Ollama (Local LLM)

#### 5.1 Install Ollama

Download and install from: https://ollama.ai/download

#### 5.2 Pull Llama-3.2 Model

```bash
ollama pull llama3.2:3b
```

#### 5.3 Verify Ollama

```bash
ollama list
ollama run llama3.2:3b "Hello, test message"
```

---

### Step 6: Set Up External APIs (Optional)

### 6.1 Bhashini API (Speech-to-Text)

1. Visit: https://bhashini.gov.in/
2. Register for an account
3. Get API credentials
4. Add to `.env` file:
   ```
   BHASHINI_API_URL=https://your-bhashini-url
   BHASHINI_API_KEY=your-api-key
   ```

### 6.2 Gemini 1.5 Flash API (Cloud LLM)

1. Visit: https://makersuite.google.com/app/apikey
2. Create an API key
3. Add to `.env` file:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```

### 6.3 Google Translation API (Optional)

1. Visit: https://cloud.google.com/translate
2. Create a project and enable Translation API
3. Create API key
4. Add to `.env` file:
   ```
   GOOGLE_TRANSLATION_API_KEY=your-translation-api-key
   ```

---

## Running the Project

### Start Backend (FastAPI)

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/macOS
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: http://localhost:8000
API docs: http://localhost:8000/docs

### Start Frontend (Next.js)

```bash
cd frontend
npm run dev -- --webpack
```

Frontend will run at: http://localhost:3000

### Start Ollama (if not running as service)

```bash
ollama serve
```

---

## Development Workflow

### 1. Make Changes to Code

- Edit backend files in `backend/app/`
- Edit frontend files in `frontend/src/`

### 2. Test Changes

- Backend: Auto-reloads with `--reload` flag
- Frontend: Auto-reloads with Hot Module Replacement

### 3. Run Tests

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
cd frontend
npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "Your commit message"
```

---

## Troubleshooting

### Issue: Python virtual environment not activating

**Solution:**
- Ensure Python is in your PATH
- Try using full path to venv Scripts
- On Windows, run PowerShell as Administrator

### Issue: PaddleOCR installation fails

**Solution:**
- Install Visual C++ Redistributable (Windows)
- Use CPU version of PaddlePaddle if GPU not available
- Try: `pip install paddlepaddle` instead of GPU version

### Issue: Ollama not working

**Solution:**
- Ensure Ollama is installed correctly
- Check if Ollama service is running: `ollama serve`
- Verify model is downloaded: `ollama list`
- Try reinstalling Ollama

### Issue: Next.js build fails

**Solution:**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (must be 18+)

### Issue: Database connection errors

**Solution:**
- Ensure SQLite file permissions are correct
- Check database file path in `.env`
- Verify SQLAlchemy is installed correctly

### Issue: API key errors

**Solution:**
- Verify API keys in `.env` file
- Check if API services are accessible
- Use mock APIs for development without keys

---

## Performance Tips

### Backend Optimization

1. Use async/await for I/O operations
2. Implement response caching
3. Use connection pooling for database
4. Enable gzip compression

### Frontend Optimization

1. Use code splitting with dynamic imports
2. Lazy load images
3. Optimize bundle size
4. Enable PWA caching

### OCR Optimization

1. Preprocess images (resize, denoise)
2. Use GPU if available
3. Cache OCR results
4. Use Web Workers for OCR processing

---

## Security Best Practices

1. **Never commit `.env` file** to git
2. **Use strong secrets** for JWT and API keys
3. **Enable HTTPS** in production
4. **Validate all inputs** on both client and server
5. **Use parameterized queries** to prevent SQL injection
6. **Sanitize outputs** to prevent XSS
7. **Implement rate limiting** on API endpoints
8. **Regularly update dependencies** for security patches

---

## Development Tools

### Recommended VS Code Extensions

1. **Python** - Python language support
2. **ESLint** - JavaScript/TypeScript linting
3. **Prettier** - Code formatting
4. **Tailwind CSS IntelliSense** - Tailwind CSS autocompletion
5. **GitLens** - Git supercharged
6. **Thunder Client** - API testing (alternative to Postman)

### Useful Commands

**Backend:**
```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Format code
black app/

# Lint code
flake8 app/
```

**Frontend:**
```bash
# Run tests
npm test

# Build for production
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

---

## Next Steps

After completing setup:

1. ✅ Read `docs/README.md` for project overview
2. ✅ Read `docs/architecture.md` for system design
3. ✅ Read `docs/rules.md` for coding standards
4. ✅ Read `EXECUTION_PLAN.md` for implementation roadmap
5. ⏭️ Start with Phase 1, Day 1 tasks

---

## Getting Help

- **Documentation**: Check `docs/` folder
- **Cognizant KT Session**: https://www.youtube.com/watch?v=8rmhrFEDwMU
- **Bhashini Docs**: https://bhashini.gov.in/
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Ollama Docs**: https://ollama.ai/docs

---

## System Requirements

### Minimum Requirements

- **CPU**: Quad-core processor
- **RAM**: 8GB (16GB recommended for LLM)
- **Storage**: 20GB free space
- **OS**: Windows 10+, macOS 12+, Ubuntu 20.04+

### Recommended Requirements

- **CPU**: 8-core processor
- **RAM**: 16GB
- **Storage**: 50GB SSD
- **GPU**: NVIDIA GPU (for OCR acceleration)

---

## License

This project is for educational purposes for the BPUT Hackathon 2026.

---

## Remember

> "It will never diagnose you. It will make sure the person who can, has everything they need in ninety seconds."

Safety first, privacy always, India-wide relevance.
