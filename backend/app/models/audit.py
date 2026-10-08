"""
Audit Log Model
Records all system events for compliance and security
"""

from sqlalchemy import Column, String, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class AuditLog(Base):
    """Audit log for all system events"""

    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    event_type = Column(String, nullable=False)  # "data_collection", "consent", "pii_anonymization", etc.
    user_id = Column(String)  # User who performed the action
    patient_id = Column(String)  # Patient affected (if applicable)
    action = Column(String, nullable=False)  # Specific action performed
    data_types = Column(JSON)  # Types of data involved
    consent_recorded = Column(Boolean, default=False)
    pii_anonymized = Column(Boolean, default=False)
    llm_processed = Column(Boolean, default=False)
    event_metadata = Column(JSON)  # Additional event details
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AuditLog(id={self.id}, event_type={self.event_type}, action={self.action})>"
