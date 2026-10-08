"""
AI Chat Routes
Patient-Doctor Multilingual AI Assistant with STT/TTS & Digital Prescription Generation
Supports 7 Indian Languages: English, Odia, Hindi, Bengali, Telugu, Tamil, Kannada
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_optional_current_user
from app.models.user import User
from app.services.audit_service import audit_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Supported Languages Mapping
LANGUAGE_NAMES = {
    "en": "English",
    "or": "Odia (ଓଡ଼ିଆ)",
    "hi": "Hindi (हिन्दी)",
    "bn": "Bengali (বাংলা)",
    "te": "Telugu (తెలుగు)",
    "ta": "Tamil (தமிழ்)",
    "kn": "Kannada (ಕನ್ನಡ)",
}


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    patient_context: Optional[dict] = None


class PrescriptionItem(BaseModel):
    name: str
    type: str  # Tablet, Syrup, Ointment, Sachet, Drops
    dosage: str  # e.g., "500 mg" or "1 tablet"
    frequency: str  # e.g., "Twice daily (1-0-1)"
    timing: str  # e.g., "After meals with water"
    duration: str  # e.g., "3 to 5 days"
    instructions: str
    precautions: str


class PrescriptionResponse(BaseModel):
    rx_id: str
    date: str
    phc_name: str
    patient_name: str
    age_gender: str
    symptoms_summary: str
    clinical_assessment: str
    medicines: List[PrescriptionItem]
    home_care_and_diet: List[str]
    precautions_and_warnings: List[str]
    when_to_see_doctor: str
    disclaimer: str
    formatted_slip_text: str


class ChatResponse(BaseModel):
    response: str
    conversation_history: List[ChatMessage]
    disclaimer: str
    prescription_suggestion: Optional[bool] = False
    prescription_data: Optional[PrescriptionResponse] = None


class GeneratePrescriptionRequest(BaseModel):
    patient_name: Optional[str] = "Patient"
    age: Optional[str] = "Adult"
    gender: Optional[str] = "Not specified"
    symptoms: str
    vitals: Optional[dict] = None
    language: Optional[str] = "en"
    conversation_history: Optional[List[ChatMessage]] = []


async def _call_gemini_api(
    system_prompt: str, formatted_contents: list, json_mode: bool = False
) -> str:
    """
    Call Gemini API with model fallback support and robust error handling.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    models_to_try = [
        settings.GEMINI_MODEL,
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-pro",
    ]

    # Remove duplicates while preserving order
    seen = set()
    candidate_models = []
    for m in models_to_try:
        if m and m not in seen:
            seen.add(m)
            candidate_models.append(m)

    gen_config = {
        "temperature": 0.3 if json_mode else settings.GEMINI_TEMPERATURE,
        "maxOutputTokens": settings.GEMINI_MAX_TOKENS,
        "topK": 40,
        "topP": 0.95,
    }
    if json_mode:
        gen_config["responseMimeType"] = "application/json"

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": formatted_contents,
        "generationConfig": gen_config,
    }

    last_error = None
    async with httpx.AsyncClient(timeout=30.0) as client:
        for model_name in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
            try:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        parts = result["candidates"][0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                else:
                    logger.warning(
                        f"Gemini API model {model_name} returned status {response.status_code}: {response.text[:200]}"
                    )
                    last_error = f"HTTP {response.status_code}: {response.text[:200]}"
            except Exception as ex:
                logger.warning(f"Error calling Gemini model {model_name}: {str(ex)}")
                last_error = str(ex)

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    chat_data: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Multilingual AI chat endpoint for patient health queries.
    Uses Google Gemini with warm, simple, human-like doctor tone in 7 Indian languages.
    """
    patient_lang_code = (
        chat_data.patient_context.get("language", "en")
        if chat_data.patient_context
        else "en"
    )
    patient_language_name = LANGUAGE_NAMES.get(patient_lang_code, "English")

    system_prompt = f"""You are a caring, friendly, and highly experienced Primary Healthcare Medical Officer (Doctor) at an Indian Community Health Center / PHC.

PATIENT LANGUAGE PREFERENCE:
- You MUST converse natively, fluently, and exclusively in: {patient_language_name}.
- Use natural, simple, and culturally warm words that any normal human being, village resident, elder, or family member can immediately understand without confusion.
- Avoid heavy medical jargon. If you mention a medical term, immediately explain it in very simple everyday language.

YOUR CONSULTATION GOALS:
1. Greet the patient warmly and empathetically like a trusted family doctor.
2. Listen carefully to their symptoms, understand their state, and reassure them kindly.
3. Explain the likely reasons for their symptoms in simple, clear human words.
4. Suggest safe supportive self-care, home remedies (e.g. hydration, warm water, steam, salt water gargle, rest, light khichdi/soup).
5. For common mild symptoms (fever, headache, body ache, acidity, mild cold/cough), you can mention common safe OTC medicines available in Indian PHCs/pharmacies (e.g., Paracetamol, ORS, Antacids, Cetirizine), clearly stating how to take them safely (e.g., after food) and reminding them to verify with a local pharmacist.
6. Clearly highlight any red-flag emergency symptoms (chest pain, shortness of breath, high persistent fever, severe pain, fainting) that require immediate hospital or doctor visits.
7. Offer to provide an official Digital Medical Prescription / Rx Slip if they need the medicine names and instructions organized neatly for the pharmacy.

IMPORTANT RULES:
- Keep sentences friendly, supportive, clear, and reassuring.
- Always be truthful, compassionate, and practical for Indian healthcare reality.
- Respond in {patient_language_name} script and phrasing."""

    # Build contents for Gemini API (only 'user' and 'model' roles allowed)
    gemini_contents = []

    # Add conversation history
    for msg in chat_data.conversation_history or []:
        role = "user" if msg.role == "user" else "model"
        if msg.content and msg.content.strip():
            # Avoid duplicate consecutive same-role turns if any
            if gemini_contents and gemini_contents[-1]["role"] == role:
                gemini_contents[-1]["parts"][0]["text"] += "\n" + msg.content
            else:
                gemini_contents.append({"role": role, "parts": [{"text": msg.content}]})

    # Prepare user prompt with patient context
    user_text = chat_data.message.strip()
    if chat_data.patient_context:
        ctx_parts = []
        if chat_data.patient_context.get("name"):
            ctx_parts.append(f"Name: {chat_data.patient_context.get('name')}")
        if chat_data.patient_context.get("age"):
            ctx_parts.append(f"Age: {chat_data.patient_context.get('age')}")
        if chat_data.patient_context.get("gender"):
            ctx_parts.append(f"Gender: {chat_data.patient_context.get('gender')}")
        if chat_data.patient_context.get("symptoms"):
            ctx_parts.append(f"Symptoms: {chat_data.patient_context.get('symptoms')}")
        if chat_data.patient_context.get("vitals"):
            ctx_parts.append(f"Vitals: {chat_data.patient_context.get('vitals')}")
        if ctx_parts:
            user_text += f"\n\n[Patient Context: {', '.join(ctx_parts)}]"

    if gemini_contents and gemini_contents[-1]["role"] == "user":
        gemini_contents[-1]["parts"][0]["text"] += "\n" + user_text
    else:
        gemini_contents.append({"role": "user", "parts": [{"text": user_text}]})

    # Call Gemini or fallback
    try:
        ai_response = await _call_gemini_api(system_prompt, gemini_contents)
    except Exception as e:
        logger.error(f"Failed to generate Gemini response: {e}", exc_info=True)
        ai_response = _get_multilingual_fallback(chat_data.message, patient_lang_code)

    # Check if this query or response suggests a prescription can be generated
    lower_res = (ai_response + " " + chat_data.message).lower()
    has_med_keywords = any(
        kw in lower_res
        for kw in [
            "medicine", "tablet", "syrup", "paracetamol", "ors", "medication",
            "treatment", "remedy", "dose", "prescription", "दवा", "औषध", "ଦବା", "ঔষধ"
        ]
    )

    # Update conversation history
    updated_history = list(chat_data.conversation_history or [])
    updated_history.append(
        ChatMessage(
            role="user",
            content=chat_data.message,
            timestamp=datetime.now(),
        )
    )
    updated_history.append(
        ChatMessage(
            role="assistant",
            content=ai_response,
            timestamp=datetime.now(),
        )
    )

    # Log audit if user is logged in
    if current_user and current_user.id:
        try:
            audit_service.log_event(
                db=db,
                event_type="ai_chat",
                action="chat_message",
                user_id=current_user.id,
                metadata={
                    "language": patient_lang_code,
                    "message_length": len(chat_data.message),
                    "response_length": len(ai_response),
                },
            )
        except Exception:
            pass

    return ChatResponse(
        response=ai_response,
        conversation_history=updated_history,
        disclaimer="AI Medical Assistant provides general health guidance. Always consult a certified healthcare professional or PHC medical officer for clinical diagnosis.",
        prescription_suggestion=has_med_keywords,
    )


@router.post("/generate-prescription", response_model=PrescriptionResponse)
async def generate_prescription(
    req: GeneratePrescriptionRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate an official, structured Digital Medical Prescription / Rx Slip
    based on patient state, query symptoms, and consultation history.
    """
    patient_lang_code = req.language or "en"
    lang_name = LANGUAGE_NAMES.get(patient_lang_code, "English")

    rx_id = f"PHC-RX-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    current_date = datetime.now().strftime("%d %b %Y, %I:%M %p")

    prescription_prompt = f"""You are an authorized Senior Medical Officer at a Government Primary Health Center (PHC).
Generate a formal, safe, and structured digital medical prescription (Rx) for a patient with the following details:

Patient Name: {req.patient_name}
Age / Gender: {req.age} / {req.gender}
Symptoms / Chief Complaints: {req.symptoms}
Vitals: {json.dumps(req.vitals) if req.vitals else "Within normal limits / Not provided"}
Target Language for Patient Instructions: {lang_name}

You must return a STRICT JSON OBJECT containing standard, safe over-the-counter and supportive medications, dosages, home care, and warning precautions.

CRITICAL SAFETY RULES:
1. Suggest ONLY safe, established first-line OTC / primary PHC supportive medications (such as Paracetamol for fever/ache, ORS/Zinc for dehydration/loose motions, Antacids/Pantoprazole for acidity, Cetirizine/Levocetirizine for mild allergy/cold, Cough syrup/Steam inhalation for cough).
2. Never suggest restricted or dangerous prescription antibiotics without doctor in-person consult.
3. Include clear dosage, frequency (e.g., 1-0-1), timing (e.g., After meals), duration, instructions, and precautions.
4. Translate patient instructions and advice clearly into {lang_name} while keeping medication names in standard readable format.

OUTPUT FORMAT (JSON ONLY, NO EXTRA CODE BLOCKS):
{{
  "symptoms_summary": "Brief summary of symptoms",
  "clinical_assessment": "Working provisional diagnosis / clinical impression",
  "medicines": [
    {{
      "name": "Paracetamol 650 mg (Dolo / Calpol)",
      "type": "Tablet",
      "dosage": "650 mg",
      "frequency": "1 tablet after meals when needed (Max 3 times a day)",
      "timing": "After food",
      "duration": "3 days",
      "instructions": "Simple instruction in {lang_name}",
      "precautions": "Do not take on an empty stomach. Maintain at least 6 hours gap."
    }}
  ],
  "home_care_and_diet": [
    "Drink plenty of boiled and cooled water (2-3 Litres daily)",
    "Eat light, easily digestible food (warm khichdi, porridge, soup)",
    "Adequate bed rest and avoid heavy physical exertion"
  ],
  "precautions_and_warnings": [
    "Consult your nearest PHC or doctor if symptoms do not improve within 48-72 hours",
    "Do not exceed recommended dosages"
  ],
  "when_to_see_doctor": "Visit the nearest Primary Health Center immediately if you develop high persistent fever above 102°F, severe chest pain, shortness of breath, or persistent vomiting.",
  "disclaimer": "This is a digital primary health guidance prescription for OTC and supportive care. Please present this to your pharmacist or PHC medical officer."
}}"""

    formatted_contents = [{"role": "user", "parts": [{"text": prescription_prompt}]}]

    try:
        raw_ai_text = await _call_gemini_api(
            "You are an authorized medical officer generating a strict JSON prescription slip. Output valid JSON only.",
            formatted_contents,
            json_mode=True,
        )
        
        # Clean JSON markdown if wrapped in ```json ... ```
        cleaned_json_text = raw_ai_text.strip()
        if cleaned_json_text.startswith("```json"):
            cleaned_json_text = cleaned_json_text[7:]
        if cleaned_json_text.startswith("```"):
            cleaned_json_text = cleaned_json_text[3:]
        if cleaned_json_text.endswith("```"):
            cleaned_json_text = cleaned_json_text[:-3]
        cleaned_json_text = cleaned_json_text.strip()

        parsed_data = json.loads(cleaned_json_text)
    except Exception as e:
        logger.warning(f"Failed to generate structured prescription from Gemini: {e}. Using clinical default fallback.")
        parsed_data = _get_default_prescription_data(req, lang_name)

    medicines_list = [
        PrescriptionItem(
            name=m.get("name", "Supportive Care"),
            type=m.get("type", "Tablet"),
            dosage=m.get("dosage", "As directed"),
            frequency=m.get("frequency", "Twice daily"),
            timing=m.get("timing", "After food"),
            duration=m.get("duration", "3 days"),
            instructions=m.get("instructions", "Take with water"),
            precautions=m.get("precautions", "Consult doctor if symptoms persist"),
        )
        for m in parsed_data.get("medicines", [])
    ]

    # Build readable formatted slip text
    med_text_lines = []
    for idx, med in enumerate(medicines_list, 1):
        med_text_lines.append(
            f"{idx}. {med.name} ({med.type})\n   • Dosage & Frequency: {med.dosage} | {med.frequency} ({med.timing})\n   • Duration: {med.duration}\n   • Instructions: {med.instructions}"
        )

    formatted_slip = f"""=====================================================
PRIMARY HEALTHCARE CENTER (PHC) - MEDICAL PRESCRIPTION
=====================================================
Rx ID: {rx_id}
Date: {current_date}
Patient: {req.patient_name} ({req.age} / {req.gender})
Symptoms: {parsed_data.get('symptoms_summary', req.symptoms)}
Assessment: {parsed_data.get('clinical_assessment', 'Symptomatic Relief & Support')}
-----------------------------------------------------
RECOMMENDED MEDICATIONS (Rx):
{chr(10).join(med_text_lines)}

SUPPORTIVE HOME CARE & DIET:
{chr(10).join(['• ' + h for h in parsed_data.get('home_care_and_diet', [])])}

EMERGENCY ADVICE / RED FLAGS:
{parsed_data.get('when_to_see_doctor', 'Visit nearest PHC if symptoms worsen.')}
-----------------------------------------------------
Disclaimer: {parsed_data.get('disclaimer', 'Consult certified doctor before purchase.')}
====================================================="""

    return PrescriptionResponse(
        rx_id=rx_id,
        date=current_date,
        phc_name="Government Primary Health Center (PHC) & Health AI Tele-Triage",
        patient_name=req.patient_name or "Patient",
        age_gender=f"{req.age} / {req.gender}",
        symptoms_summary=parsed_data.get("symptoms_summary", req.symptoms),
        clinical_assessment=parsed_data.get("clinical_assessment", "Symptomatic Care"),
        medicines=medicines_list,
        home_care_and_diet=parsed_data.get("home_care_and_diet", ["Drink plenty of clean water", "Rest properly"]),
        precautions_and_warnings=parsed_data.get("precautions_and_warnings", ["Keep away from children", "Do not exceed dosage"]),
        when_to_see_doctor=parsed_data.get("when_to_see_doctor", "Visit hospital if severe pain or high fever persists."),
        disclaimer=parsed_data.get("disclaimer", "This digital prescription is generated for initial symptomatic care. Verify with pharmacist or doctor."),
        formatted_slip_text=formatted_slip,
    )


def _get_default_prescription_data(req: GeneratePrescriptionRequest, lang_name: str) -> dict:
    """Clinical safe default prescription in case of JSON parse failure"""
    sym = (req.symptoms or "").lower()
    
    if "fever" in sym or "headache" in sym or "pain" in sym:
        return {
            "symptoms_summary": "Fever / Body Ache / Mild Pain",
            "clinical_assessment": "Mild Viral Pyrexia / Tension Headache",
            "medicines": [
                {
                    "name": "Paracetamol 650 mg (Dolo / Calpol)",
                    "type": "Tablet",
                    "dosage": "650 mg",
                    "frequency": "1 tablet when fever is above 100°F (Max 3 times daily)",
                    "timing": "After meals",
                    "duration": "3 days",
                    "instructions": "Take with a glass of warm water. Maintain minimum 6 hours gap.",
                    "precautions": "Avoid alcohol and do not take other paracetamol-containing cold medicines at same time."
                },
                {
                    "name": "Oral Rehydration Salts (ORS) / Electral",
                    "type": "Sachet",
                    "dosage": "1 sachet in 1 Litre boiled & cooled water",
                    "frequency": "Sip throughout the day",
                    "timing": "Throughout the day",
                    "duration": "2-3 days",
                    "instructions": "Keeps body hydrated and replenishes essential minerals.",
                    "precautions": "Do not mix with milk or boiling hot water."
                }
            ],
            "home_care_and_diet": [
                "Adequate bed rest in a well-ventilated room",
                "Drink plenty of fluids (coconut water, warm dal soup, lemon water)",
                "Use normal temperature wet cloth sponging on forehead if fever is high"
            ],
            "precautions_and_warnings": [
                "Do not take medicines on an empty stomach",
                "Do not exceed recommended frequency"
            ],
            "when_to_see_doctor": "Visit PHC immediately if fever exceeds 103°F, persists over 3 days, or causes severe shivering/confusion.",
            "disclaimer": "General OTC recommendation for primary relief. Consult a registered medical practitioner if symptoms persist."
        }
    
    # Generic default
    return {
        "symptoms_summary": req.symptoms or "General Health Query",
        "clinical_assessment": "Symptomatic Primary Consultation",
        "medicines": [
            {
                "name": "Multivitamin & Zinc Supportive Supplement",
                "type": "Tablet",
                "dosage": "1 Tablet daily",
                "frequency": "Once daily (1-0-0)",
                "timing": "After breakfast",
                "duration": "5 days",
                "instructions": "Helps boost immunity and recover energy.",
                "precautions": "Take with plenty of water."
            }
        ],
        "home_care_and_diet": [
            "Maintain proper hydration with clean boiled water",
            "Eat fresh, home-cooked light meals",
            "Get 7-8 hours of sound sleep"
        ],
        "precautions_and_warnings": [
            "Avoid outside and junk food",
            "Monitor your symptoms closely"
        ],
        "when_to_see_doctor": "Consult your local PHC medical officer if symptoms do not subside in 48 hours.",
        "disclaimer": "Primary healthcare advice. Please verify with pharmacist or attending doctor."
    }


def _get_multilingual_fallback(message: str, lang_code: str) -> str:
    """High-quality localized human fallback responses for all 7 languages."""
    msg_lower = message.lower()
    is_emergency = any(k in msg_lower for k in ["chest pain", "breathing", "bleeding", "unconscious", "heart attack", "stroke", "severe"])

    # Fallback dictionary for 7 languages
    fallbacks = {
        "or": {
            "emergency": "⚠️ ଏହା ଏକ ଜରୁରୀକାଳୀନ ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ହୋଇପାରେ। ଦୟାକରି ତୁରନ୍ତ ନିକଟସ୍ଥ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର (PHC) କିମ୍ବା ଡାକ୍ତରଖାନାକୁ ଯାଆନ୍ତୁ ଏବଂ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ। ବିଳମ୍ବ କରନ୍ତୁ ନାହିଁ।",
            "general": "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ AI। ଆପଣଙ୍କ ଲକ୍ଷଣ ଅନୁଯାୟୀ ଯଥେଷ୍ଟ ବିଶ୍ରାମ ନିଅନ୍ତୁ, ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ ଏବଂ ହାଲୁକା ଖାଦ୍ୟ ଖାଆନ୍ତୁ। ଯଦି ଆବଶ୍ୟକ ହୁଏ, ଆପଣ ତଳେ ଥିବା ବଟନ୍ ଦବାଇ ଔଷଧ ପରାମର୍ଶ (Prescription) ଦେଖିପାରିବେ। ନିକଟସ୍ଥ PHC ଡାକ୍ତରଙ୍କ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।"
        },
        "hi": {
            "emergency": "⚠️ यह एक आपातकालीन स्थिति हो सकती है। कृपया बिना देर किए तुरंत अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या अस्पताल जाएं और डॉक्टर से संपर्क करें।",
            "general": "नमस्ते! मैं आपका स्वास्थ्य सहायक AI हूँ। अपनी सेहत का ध्यान रखें, भरपूर पानी पिएं, हल्का व सुपाच्य भोजन लें और पर्याप्त आराम करें। यदि आपको दवाओं की सूची और सलाह चाहिए तो आप 'Prescription' बटन दबाकर पर्चा देख सकते हैं।"
        },
        "bn": {
            "emergency": "⚠️ এটি একটি জরুরি স্বাস্থ্য পরিস্থিতি হতে পারে। অবিলম্বে নিকটস্থ প্রাথমিক স্বাস্থ্য কেন্দ্র (PHC) বা হাসপাতালে যান এবং ডাক্তারের পরামর্শ নিন।",
            "general": "নমস্কার! আমি আপনার স্বাস্থ্য সহকারী AI। পর্যাপ্ত বিশ্রাম নিন, প্রচুর জল পান করুন এবং সহজপাচ্য খাবার খান। ওষুধের পরামর্শের জন্য আপনি প্রেসক্রিপশন জেনারেট করতে পারেন। লক্ষণ না কমলে নিকটস্থ স্বাস্থ্যকেন্দ্রে যোগাযোগ করুন।"
        },
        "te": {
            "emergency": "⚠️ ఇది అత్యవసర వైద్య పరిస్థితి కావచ్చు. దయచేసి ఆలస్యం చేయకుండా వెంటనే సమీపంలోని ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) లేదా ఆసుపత్రికి వెళ్ళండి.",
            "general": "నమస్కారం! నేను మీ ఆరోగ్య సహాయక AIని. తగినంత విశ్రాంతి తీసుకోండి, పుష్కలంగా నీరు త్రాగండి మరియు తేలికపాటి ఆహారం తీసుకోండి. మందుల సలహా కోసం మీరు ప్రిస్క్రిప్షన్‌ను రూపొందించవచ్చు."
        },
        "ta": {
            "emergency": "⚠️ இது ஒரு அவசர மருத்துவ நிலையாக இருக்கலாம். தயவுசெய்து உடனடியாக அருகிலுள்ள ஆரம்ப சுகாதார நிலையம் (PHC) அல்லது மருத்துவமனைக்குச் செல்லுங்கள்.",
            "general": "வணக்கம்! நான் உங்கள் சுகாதார உதவியாளர் AI. போதுமான ஓய்வு எடுங்கள், நிறைய தண்ணீர் குடியுங்கள், எளிய உணவை உண்ணுங்கள். மருந்து ஆலோசனைகளுக்கு நீங்கள் மருந்துச் சீட்டை (Prescription) பெறலாம்."
        },
        "kn": {
            "emergency": "⚠️ ಇದು ತುರ್ತು ವೈದ್ಯಕೀಯ ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ದಯವಿಟ್ಟು ತಕ್ಷಣ ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC) ಅಥವಾ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.",
            "general": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ AI. ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ, ಹೆಚ್ಚು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಲಘು ಆಹಾರ ಸೇವಿಸಿ. ಅಗತ್ಯವಿದ್ದರೆ ನೀವು ಔಷಧಿ ಸಲಹಾ ಚೀಟಿಯನ್ನು (Prescription) ರಚಿಸಿಕೊಳ್ಳಬಹುದು."
        },
        "en": {
            "emergency": "⚠️ Based on your symptoms, this could be a medical emergency. Please visit your nearest Primary Health Center (PHC) or hospital immediately. Do not delay.",
            "general": "Hello! I am your AI Health Assistant. For your symptoms, ensure you stay well-hydrated, take adequate rest, and eat light, easily digestible meals. You can generate an official supportive prescription slip below or consult your local PHC medical officer."
        }
    }

    lang_data = fallbacks.get(lang_code, fallbacks["en"])
    return lang_data["emergency"] if is_emergency else lang_data["general"]

