"""
Health Triage AI - FastAPI Backend
Main entry point for the application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.consent import router as consent_router
from app.api.routes.patient import router as patient_router
from app.api.routes.triage import router as triage_router
from app.api.routes.ai_chat import router as ai_chat_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multimodal Healthcare Triage Assistant for Indian PHCs"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS.split(','),
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(consent_router, prefix="/api/consent", tags=["Consent"])
app.include_router(patient_router, prefix="/api/patients", tags=["Patients"])
app.include_router(triage_router, prefix="/api/triage", tags=["Triage"])
app.include_router(ai_chat_router, prefix="/api/ai", tags=["AI Chat"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Health Triage AI API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True
    )
