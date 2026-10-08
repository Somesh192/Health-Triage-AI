"""
Models Package
Import all models here for easy access
"""

from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.triage import TriageNote, UrgencyLevel
from app.models.consent import Consent, ConsentType
from app.models.audit import AuditLog

__all__ = [
    "User",
    "UserRole",
    "Patient",
    "TriageNote",
    "UrgencyLevel",
    "Consent",
    "ConsentType",
    "AuditLog",
]
