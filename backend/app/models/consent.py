"""
Consent Model
Records patient consent for data collection and processing
"""

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ConsentType(str, enum.Enum):
    """Types of consent required"""
    VOICE_RECORDING = "voice_recording"
    DOCUMENT_UPLOAD = "document_upload"
    AI_PROCESSING = "ai_processing"
    DATA_STORAGE = "data_storage"


class Consent(Base):
    """Consent record for patient data collection"""

    __tablename__ = "consents"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    consent_type = Column(String, nullable=False)
    granted = Column(Boolean, default=True)
    consent_method = Column(String)  # "touch", "voice", "signature"
    consent_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    consent_metadata = Column(JSON)  # Additional consent details (location, device, etc.)

    # Relationship
    patient = relationship("Patient", backref="consents")

    def __repr__(self):
        return f"<Consent(id={self.id}, type={self.consent_type}, granted={self.granted})>"
