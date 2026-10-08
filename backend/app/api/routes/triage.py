"""
Triage Routes
Triage assessment and management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.triage import TriageNote, UrgencyLevel
from app.models.user import User
from app.models.patient import Patient
from app.engines.rule_engine import rule_engine
from app.engines.llm_engine import llm_engine
from app.services.audit_service import audit_service
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()


class TriageRequest(BaseModel):
    patient_id: str
    symptoms: str
    vitals: dict
    lab_results: dict = {}


from typing import Union

class TriageResponse(BaseModel):
    id: str
    patient_id: str
    urgency: str
    chief_complaint: str
    vitals_and_labs: str
    urgency_signals: Union[list, str]
    missing_info: Union[list, str]
    suggested_questions: Union[list, str]
    created_at: datetime


@router.post("/assess", response_model=TriageResponse)
async def assess_triage(
    triage_data: TriageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Assess patient triage using hybrid engine (rules + LLM)
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == triage_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    # Step 1: Run rule engine (deterministic - always runs first)
    rule_result = rule_engine.assess_urgency(triage_data.vitals, {"symptoms": triage_data.symptoms})

    # Step 2: Run LLM for natural language synthesis
    llm_result = await llm_engine.generate_triage_note(
        symptoms=triage_data.symptoms,
        vitals=triage_data.vitals,
        lab_results=triage_data.lab_results
    )

    # Step 3: Combine results (rules override LLM for urgency)
    urgency = rule_result["urgency"]  # Rule engine decides urgency

    # Create triage note
    import json
    urgency_signals = rule_result["messages"] + llm_result.get("urgency_signals", [])
    missing_info = rule_engine.get_missing_vitals(triage_data.vitals) + llm_result.get("missing_info", [])
    suggested_questions = llm_result.get("suggested_questions", [])

    triage_note = TriageNote(
        id=str(uuid.uuid4()),
        patient_id=triage_data.patient_id,
        urgency=urgency,
        chief_complaint=llm_result.get("chief_complaint", ""),
        vitals_and_labs=json.dumps(llm_result.get("vitals_and_labs", {})),
        urgency_signals=json.dumps(urgency_signals),
        missing_info=json.dumps(missing_info),
        suggested_questions=json.dumps(suggested_questions),
        rule_engine_output=json.dumps(rule_result),
        llm_output=json.dumps(llm_result)
    )

    db.add(triage_note)
    db.commit()
    db.refresh(triage_note)

    # Log audit event
    audit_service.log_event(
        db=db,
        event_type="triage_assessment",
        action="triage_created",
        user_id=current_user.id,
        patient_id=triage_data.patient_id,
        data_types=["symptoms", "vitals", "lab_results"],
        llm_processed=True,
        metadata={
            "urgency": urgency,
            "rule_engine_triggered": len(rule_result["triggered_rules"]) > 0
        }
    )

    return TriageResponse(
        id=triage_note.id,
        patient_id=triage_note.patient_id,
        urgency=triage_note.urgency,
        chief_complaint=triage_note.chief_complaint,
        vitals_and_labs=triage_note.vitals_and_labs,
        urgency_signals=urgency_signals,
        missing_info=missing_info,
        suggested_questions=suggested_questions,
        created_at=triage_note.created_at
    )


@router.get("/patient/{patient_id}", response_model=List[TriageResponse])
async def get_patient_triage_notes(
    patient_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all triage notes for a patient
    """
    import json
    notes = db.query(TriageNote).filter(
        TriageNote.patient_id == patient_id
    ).order_by(TriageNote.created_at.desc()).all()

    return [
        TriageResponse(
            id=note.id,
            patient_id=note.patient_id,
            urgency=note.urgency,
            chief_complaint=note.chief_complaint,
            vitals_and_labs=note.vitals_and_labs,
            urgency_signals=json.loads(note.urgency_signals) if isinstance(note.urgency_signals, str) else note.urgency_signals,
            missing_info=json.loads(note.missing_info) if isinstance(note.missing_info, str) else note.missing_info,
            suggested_questions=json.loads(note.suggested_questions) if isinstance(note.suggested_questions, str) else note.suggested_questions,
            created_at=note.created_at
        )
        for note in notes
    ]


@router.get("/queue")
async def get_triage_queue(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get triage queue sorted by urgency (RED first)
    """
    # Get all unreviewed triage notes
    notes = db.query(TriageNote).filter(
        TriageNote.reviewed_by.is_(None)
    ).order_by(TriageNote.created_at.asc()).all()

    # Sort manually by urgency
    urgency_priority = {"RED": 0, "AMBER": 1, "GREEN": 2}
    notes_sorted = sorted(notes, key=lambda x: urgency_priority.get(x.urgency, 3))

    return [
        {
            "id": note.id,
            "patient_id": note.patient_id,
            "urgency": note.urgency,
            "chief_complaint": note.chief_complaint,
            "created_at": note.created_at,
            "wait_time": (datetime.utcnow() - note.created_at).total_seconds() / 60  # minutes
        }
        for note in notes_sorted
    ]
