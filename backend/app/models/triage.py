"""
Triage Note Model
Represents triage assessment results
"""

from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class UrgencyLevel(str, enum.Enum):
    """Urgency levels for triage"""
    RED = "RED"      # Critical - Immediate attention
    AMBER = "AMBER"  # Warning - Prioritize
    GREEN = "GREEN"  # Routine - Normal queue


class TriageNote(Base):
    """Triage note with assessment results"""

    __tablename__ = "triage_notes"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    urgency = Column(String, default=UrgencyLevel.GREEN, nullable=False)

    # 5-part triage note structure
    chief_complaint = Column(Text)
    vitals_and_labs = Column(Text)  # Extracted vitals and lab alerts (as JSON string)
    urgency_signals = Column(Text)  # List of urgency signals (as JSON string)
    missing_info = Column(Text)  # List of missing information (as JSON string)
    suggested_questions = Column(Text)  # Questions for doctor (as JSON string)

    # Rule engine and LLM outputs (as JSON strings)
    rule_engine_output = Column(Text)
    llm_output = Column(Text)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reviewed_by = Column(String)  # User ID of reviewing doctor
    reviewed_at = Column(DateTime(timezone=True))

    # Relationship
    patient = relationship("Patient", backref="triage_notes")

    def __repr__(self):
        return f"<TriageNote(id={self.id}, urgency={self.urgency})>"
