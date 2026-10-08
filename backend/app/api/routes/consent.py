"""
Consent Routes
Consent recording and management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.consent import Consent, ConsentType
from app.models.user import User
from app.services.audit_service import audit_service
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()


class ConsentRequest(BaseModel):
    patient_id: str
    consent_type: ConsentType
    granted: bool = True
    consent_method: str  # "touch", "voice", "signature"
    metadata: dict = {}


class ConsentResponse(BaseModel):
    id: str
    patient_id: str
    consent_type: str
    granted: bool
    consent_method: str
    consent_timestamp: datetime
    consent_metadata: dict = {}


@router.post("/record", response_model=ConsentResponse)
async def record_consent(
    consent_data: ConsentRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Record patient consent for data collection
    """
    consent = Consent(
        id=str(uuid.uuid4()),
        patient_id=consent_data.patient_id,
        consent_type=consent_data.consent_type.value,
        granted=consent_data.granted,
        consent_method=consent_data.consent_method,
        consent_metadata=consent_data.metadata
    )

    db.add(consent)
    db.commit()
    db.refresh(consent)

    # Log audit event
    audit_service.log_event(
        db=db,
        event_type="consent",
        action="consent_recorded",
        user_id=current_user.id,
        patient_id=consent_data.patient_id,
        consent_recorded=True,
        metadata={
            "consent_type": consent_data.consent_type.value,
            "method": consent_data.consent_method
        }
    )

    return consent


@router.get("/patient/{patient_id}", response_model=List[ConsentResponse])
async def get_patient_consents(
    patient_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all consents for a patient
    """
    consents = db.query(Consent).filter(
        Consent.patient_id == patient_id
    ).all()
    return consents


@router.get("/check/{patient_id}")
async def check_consent_status(
    patient_id: str,
    consent_type: ConsentType,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Check if patient has given specific consent
    """
    consent = db.query(Consent).filter(
        Consent.patient_id == patient_id,
        Consent.consent_type == consent_type.value,
        Consent.granted == True
    ).first()

    return {
        "has_consent": consent is not None,
        "consent_id": consent.id if consent else None,
        "consent_timestamp": consent.consent_timestamp if consent else None
    }
