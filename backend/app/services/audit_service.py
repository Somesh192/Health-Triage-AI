"""
Audit Logging Service
Records all system events for compliance
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
import uuid


class AuditService:
    """Service for logging audit events"""

    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        action: str,
        user_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        data_types: Optional[List[str]] = None,
        consent_recorded: bool = False,
        pii_anonymized: bool = False,
        llm_processed: bool = False,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """
        Log an audit event

        Args:
            db: Database session
            event_type: Type of event (data_collection, consent, pii_anonymization, etc.)
            action: Specific action performed
            user_id: User who performed the action
            patient_id: Patient affected
            data_types: Types of data involved
            consent_recorded: Whether consent was recorded
            pii_anonymized: Whether PII was anonymized
            llm_processed: Whether LLM was used
            metadata: Additional event details

        Returns:
            AuditLog object
        """
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            event_type=event_type,
            user_id=user_id,
            patient_id=patient_id,
            action=action,
            data_types=data_types or [],
            consent_recorded=consent_recorded,
            pii_anonymized=pii_anonymized,
            llm_processed=llm_processed,
            event_metadata=metadata or {},
        )

        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)

        return audit_log

    @staticmethod
    def get_user_events(db: Session, user_id: str, limit: int = 100) -> List[AuditLog]:
        """Get audit events for a specific user"""
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.timestamp.desc()).limit(limit).all()

    @staticmethod
    def get_patient_events(db: Session, patient_id: str, limit: int = 100) -> List[AuditLog]:
        """Get audit events for a specific patient"""
        return db.query(AuditLog).filter(
            AuditLog.patient_id == patient_id
        ).order_by(AuditLog.timestamp.desc()).limit(limit).all()


# Global instance
audit_service = AuditService()
