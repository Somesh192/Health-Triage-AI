"""
PII Detection and Anonymization Service
Detects and redacts personally identifiable information
"""

import re
import spacy
from typing import List, Dict, Tuple
from app.core.config import settings

# Load spaCy model
nlp = spacy.load("en_core_web_sm")


class PIIDetector:
    """Detects PII in text"""

    # Regex patterns for PII
    PATTERNS = {
        "aadhaar": r"\b\d{12}\b",  # 12-digit Aadhaar number
        "phone": r"\b\d{10}\b",  # 10-digit phone number
        "phone_with_prefix": r"\+91\s?\d{10}",  # Phone with +91 prefix
        "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",  # Email
    }

    def __init__(self):
        self.nlp = nlp

    def detect_pii(self, text: str) -> List[Dict]:
        """
        Detect PII in text using both regex and NER

        Returns:
            List of detected PII with type, value, and position
        """
        pii_found = []

        # Regex-based detection
        for pii_type, pattern in self.PATTERNS.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                pii_found.append({
                    "type": pii_type,
                    "value": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "method": "regex"
                })

        # NER-based detection (names, locations, organizations)
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "GPE", "ORG", "LOC"]:
                pii_found.append({
                    "type": ent.label_,
                    "value": ent.text,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "method": "ner"
                })

        return pii_found

    def has_pii(self, text: str) -> bool:
        """Check if text contains any PII"""
        return len(self.detect_pii(text)) > 0


class PIIAnonymizer:
    """Anonymizes PII in text"""

    def __init__(self):
        self.detector = PIIDetector()

    def anonymize(self, text: str) -> Tuple[str, List[Dict]]:
        """
        Anonymize PII in text

        Returns:
            Tuple of (anonymized_text, pii_redactions)
        """
        pii_list = self.detector.detect_pii(text)
        anonymized_text = text
        redactions = []

        # Sort by position in reverse order to avoid index shifting
        pii_list_sorted = sorted(pii_list, key=lambda x: x["start"], reverse=True)

        for pii in pii_list_sorted:
            pii_type = pii["type"]
            placeholder = f"<{pii_type.upper()}_RED>"

            # Replace PII with placeholder
            anonymized_text = (
                anonymized_text[:pii["start"]] +
                placeholder +
                anonymized_text[pii["end"]:]
            )

            redactions.append({
                "type": pii_type,
                "original": pii["value"],
                "placeholder": placeholder,
                "position": (pii["start"], pii["end"])
            })

        return anonymized_text, redactions


# Global instances
pii_detector = PIIDetector()
pii_anonymizer = PIIAnonymizer()
