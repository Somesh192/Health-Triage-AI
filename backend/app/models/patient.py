"""
Patient Model
Represents patient information (anonymized for privacy)
"""

from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Patient(Base):
    """Patient model with anonymized data"""

    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    anonymous_id = Column(String, unique=True, index=True, nullable=False)  # Anonymous identifier
    age = Column(Integer)
    gender = Column(String)  # Optional: can be anonymized
    symptoms_text = Column(Text)  # Original symptoms
    symptoms_anonymized = Column(Text)  # PII-redacted symptoms
    vitals = Column(Text)  # SpO2, temperature, BP, etc. (as JSON string)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String)  # User ID who created the record

    def __repr__(self):
        return f"<Patient(id={self.id}, anonymous_id={self.anonymous_id})>"
