"""
API Routes Package
Import all route modules here
"""

from app.api.routes import auth, consent, patient, triage, ai_chat

__all__ = ["auth", "consent", "patient", "triage", "ai_chat"]