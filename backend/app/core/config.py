"""
Application Configuration
Environment-based settings management
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Search for .env in current dir, all parent dirs up to root
current_path = Path(__file__).resolve()
found_env_files = []
for parent in [Path.cwd(), *current_path.parents]:
    env_candidate = parent / ".env"
    if env_candidate.exists() and str(env_candidate) not in found_env_files:
        found_env_files.append(str(env_candidate))
        load_dotenv(dotenv_path=str(env_candidate), override=True)

class Settings(BaseSettings):
    """Application settings"""

    # App Configuration
    APP_NAME: str = "Health Triage AI"
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Backend Configuration
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    BACKEND_URL: str = "http://localhost:8000"

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./health_triage.db"

    # Authentication
    JWT_SECRET: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000"
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: str = "GET,POST,PUT,DELETE,OPTIONS"
    CORS_ALLOW_HEADERS: str = "*"

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:latest"
    OLLAMA_TIMEOUT: int = 300

    # Gemini API Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_MAX_TOKENS: int = 2000

    # Bhashini API Configuration
    BHASHINI_API_URL: str = ""
    BHASHINI_API_KEY: str = ""
    BHASHINI_USER_ID: str = ""
    BHASHINI_WORKER_ID: str = ""

    # File Upload Configuration
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "jpg", "jpeg", "png"]
    UPLOAD_DIR: str = "./uploads"
    TEMP_DIR: str = "./temp"

    # Privacy Configuration
    DATA_RETENTION_DAYS: int = 30
    PII_DETECTION_ENABLED: bool = True
    PII_REDACTION_ENABLED: bool = True

    # Audit Logging
    AUDIT_LOG_ENABLED: bool = True
    AUDIT_LOG_FILE: str = "./logs/audit.log"
    AUDIT_LOG_LEVEL: str = "INFO"

    # Feature Flags
    FEATURE_VOICE_INPUT: bool = True
    FEATURE_OCR_PROCESSING: bool = True
    FEATURE_LLM_SUMMARIZATION: bool = True
    FEATURE_RULE_ENGINE: bool = True
    FEATURE_DASHBOARD: bool = True
    FEATURE_REFERRAL_GENERATION: bool = True
    FEATURE_OFFLINE_MODE: bool = True

    # Development
    USE_MOCK_APIS: bool = False
    MOCK_VOICE_RESPONSE: bool = True
    MOCK_LLM_RESPONSE: bool = True
    MOCK_OCR_RESPONSE: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


# Create settings instance
settings = Settings()

