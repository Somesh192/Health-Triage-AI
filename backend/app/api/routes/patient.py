"""
Patient Routes
Patient data management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.patient import Patient
from app.models.user import User
from app.services.pii_service import pii_anonymizer
from app.services.audit_service import audit_service
import json
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()


class PatientCreate(BaseModel):
    anonymous_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    symptoms_text: str
    vitals: dict = {}


class PatientResponse(BaseModel):
    id: str
    anonymous_id: str
    age: Optional[int]
    gender: Optional[str]
    symptoms_anonymized: str
    vitals: str
    created_at: datetime
    created_by: str


@router.post("/", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new patient record with PII anonymization
    """
    # Anonymize symptoms
    symptoms_anonymized, redactions = pii_anonymizer.anonymize(patient_data.symptoms_text)

    patient = Patient(
        id=str(uuid.uuid4()),
        anonymous_id=patient_data.anonymous_id,
        age=patient_data.age,
        gender=patient_data.gender,
        symptoms_text=patient_data.symptoms_text,
        symptoms_anonymized=symptoms_anonymized,
        vitals=json.dumps(patient_data.vitals),
        created_by=current_user.id
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Log audit event
    audit_service.log_event(
        db=db,
        event_type="data_collection",
        action="patient_created",
        user_id=current_user.id,
        patient_id=patient.id,
        data_types=["symptoms", "vitals"],
        pii_anonymized=len(redactions) > 0,
        metadata={
            "redactions_count": len(redactions),
            "anonymized": len(redactions) > 0
        }
    )

    return PatientResponse(
        id=patient.id,
        anonymous_id=patient.anonymous_id,
        age=patient.age,
        gender=patient.gender,
        symptoms_anonymized=patient.symptoms_anonymized,
        vitals=patient.vitals,
        created_at=patient.created_at,
        created_by=patient.created_by
    )


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get patient by ID
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
    )
    return PatientResponse(
        id=patient.id,
        anonymous_id=patient.anonymous_id,
        age=patient.age,
        gender=patient.gender,
        symptoms_anonymized=patient.symptoms_anonymized,
        vitals=patient.vitals,
        created_at=patient.created_at,
        created_by=patient.created_by
    )


@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all patients
    """
    patients = db.query(Patient).offset(skip).limit(limit).all()
    return patients
