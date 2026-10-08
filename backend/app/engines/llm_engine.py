"""
LLM Engine
Integrates with Ollama for local LLM processing
"""

import httpx
from typing import Dict, Optional
from app.core.config import settings


class LLMEngine:
    """LLM engine using Ollama for local inference"""

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT

    async def generate_triage_note(
        self,
        symptoms: str,
        vitals: Dict,
        lab_results: Optional[Dict] = None
    ) -> Dict:
        """
        Generate a 5-part triage note using LLM (with fallback)

        Args:
            symptoms: Patient symptoms text
            vitals: Vital signs dictionary
            lab_results: Lab results dictionary (optional)

        Returns:
            Dictionary with triage note components
        """
        try:
            # Try to use Ollama for LLM generation
            prompt = self._build_prompt(symptoms, vitals, lab_results)

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.3,
                            "num_predict": 500
                        }
                    }
                )

                if response.status_code == 200:
                    result = response.json()
                    llm_output = result.get("response", "")
                    if llm_output:
                        return self._parse_llm_output(llm_output)
        except Exception as e:
            # Fallback to basic structure if LLM fails
            pass

        return self._get_fallback_triage_note(symptoms, vitals)

    def _build_prompt(self, symptoms: str, vitals: Dict, lab_results: Optional[Dict]) -> str:
        """Build the prompt for LLM"""
        prompt = f"""You are a clinical triage assistant for Indian PHCs. Your role is to ORGANIZE, NOT DIAGNOSE. Extract and structure information for doctor review.

PATIENT INPUT:
Symptoms: {symptoms}
Vitals: {vitals}
Lab Results: {lab_results if lab_results else "Not provided"}

TASK: Generate a 5-part triage note in JSON format:
{{
  "chief_complaint": "Summary of primary complaint in 1-2 sentences",
  "vitals_and_labs": "List of measured vitals and lab values with reference ranges",
  "urgency_signals": ["List of any critical indicators"],
  "missing_info": ["List of essential data not provided"],
  "suggested_questions": ["3-5 focused questions for the reviewing physician"]
}}

DISCLAIMER: This is a triage support tool. Only qualified medical professionals can diagnose and prescribe treatment.

Output only the JSON, no other text."""

        return prompt

    def _parse_llm_output(self, llm_output: str) -> Dict:
        """Parse LLM output into structured format"""
        import json

        try:
            # Try to extract JSON from output
            start = llm_output.find("{")
            end = llm_output.rfind("}") + 1

            if start != -1 and end > start:
                json_str = llm_output[start:end]
                return json.loads(json_str)
        except:
            pass

        # Fallback to basic structure
        return self._get_fallback_triage_note(llm_output, {})

    def _get_fallback_triage_note(self, symptoms: str, vitals: Dict) -> Dict:
        """Get fallback triage note when LLM fails"""
        return {
            "chief_complaint": symptoms[:200] if symptoms else "No symptoms provided",
            "vitals_and_labs": str(vitals) if vitals else "No vitals recorded",
            "urgency_signals": [],
            "missing_info": ["Complete data not available"],
            "suggested_questions": [
                "What is the primary concern?",
                "How long have symptoms persisted?",
                "Any previous medical history?"
            ]
        }


# Global instance
llm_engine = LLMEngine()
