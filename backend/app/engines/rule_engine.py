"""
Deterministic Rule Engine
Implements ICMR PHC protocols for clinical safety
"""

from typing import Dict, List, Optional
from enum import Enum


class UrgencyLevel(str, Enum):
    """Urgency levels"""
    RED = "RED"      # Critical - Immediate attention
    AMBER = "AMBER"  # Warning - Prioritize
    GREEN = "GREEN"  # Routine - Normal queue


class RuleEngine:
    """
    Deterministic rule engine based on ICMR PHC protocols
    Rules always override LLM suggestions
    """

    # Critical rules (forced RED)
    CRITICAL_RULES = {
        "spo2_critical": {
            "condition": lambda v: v.get("spo2", 100) < 90,
            "urgency": UrgencyLevel.RED,
            "action": "IMMEDIATE_RESCUSCITATION",
            "message": "Critical oxygen saturation - Immediate doctor alert"
        },
        "sys_bp_critical": {
            "condition": lambda v: v.get("systolic_bp", 120) > 180,
            "urgency": UrgencyLevel.RED,
            "action": "HYPERTENSIVE_CRISIS",
            "message": "Severe hypertension - Urgent evaluation"
        },
        "severe_dyspnea": {
            "condition": lambda v: "severe" in str(v.get("breathing_difficulty", "")).lower(),
            "urgency": UrgencyLevel.RED,
            "action": "RESPIRATORY_DISTRESS",
            "message": "Severe breathing difficulty - Immediate attention"
        },
        "temp_critical": {
            "condition": lambda v: v.get("temperature", 37) > 40 or v.get("temperature", 37) < 35,
            "urgency": UrgencyLevel.RED,
            "action": "EXTREME_TEMPERATURE",
            "message": "Extreme body temperature - Immediate evaluation"
        }
    }

    # Warning rules (AMBER)
    WARNING_RULES = {
        "hgb_low": {
            "condition": lambda v: v.get("hemoglobin", 15) < 7.0,
            "urgency": UrgencyLevel.AMBER,
            "action": "SEVERE_ANEMIA",
            "message": "Severe anemia - Prioritize evaluation"
        },
        "platelets_low": {
            "condition": lambda v: v.get("platelets", 250000) < 50000,
            "urgency": UrgencyLevel.AMBER,
            "action": "THROMBOCYTOPENIA",
            "message": "Low platelet count - Investigate cause"
        },
        "spo2_warning": {
            "condition": lambda v: 90 <= v.get("spo2", 100) < 94,
            "urgency": UrgencyLevel.AMBER,
            "action": "MILD_HYPOXIA",
            "message": "Mild hypoxia - Monitor closely"
        },
        "bp_high": {
            "condition": lambda v: 140 < v.get("systolic_bp", 120) <= 180,
            "urgency": UrgencyLevel.AMBER,
            "action": "ELEVATED_BP",
            "message": "Elevated blood pressure - Monitor"
        },
        "fever_prolonged": {
            "condition": lambda v: v.get("fever_days", 0) > 5,
            "urgency": UrgencyLevel.AMBER,
            "action": "PROLONGED_FEVER",
            "message": "Prolonged fever - Further investigation needed"
        }
    }

    def __init__(self):
        """Initialize rule engine"""
        self.all_rules = {**self.CRITICAL_RULES, **self.WARNING_RULES}

    def assess_urgency(self, vitals: Dict, symptoms: Dict = None) -> Dict:
        """
        Assess patient urgency based on rules

        Args:
            vitals: Dictionary of vital signs
            symptoms: Dictionary of symptoms

        Returns:
            Dictionary with urgency level, triggered rules, and messages
        """
        if symptoms is None:
            symptoms = {}

        # Combine vitals and symptoms for rule evaluation
        combined_data = {**vitals, **symptoms}

        triggered_rules = []
        max_urgency = UrgencyLevel.GREEN
        messages = []

        # Check critical rules first (highest priority)
        for rule_name, rule in self.CRITICAL_RULES.items():
            if rule["condition"](combined_data):
                triggered_rules.append({
                    "rule": rule_name,
                    "urgency": rule["urgency"].value,
                    "action": rule["action"],
                    "message": rule["message"]
                })
                messages.append(rule["message"])
                max_urgency = UrgencyLevel.RED

        # If no critical rules, check warning rules
        if max_urgency == UrgencyLevel.GREEN:
            for rule_name, rule in self.WARNING_RULES.items():
                if rule["condition"](combined_data):
                    triggered_rules.append({
                        "rule": rule_name,
                        "urgency": rule["urgency"].value,
                        "action": rule["action"],
                        "message": rule["message"]
                    })
                    messages.append(rule["message"])
                    max_urgency = UrgencyLevel.AMBER

        return {
            "urgency": max_urgency.value,
            "triggered_rules": triggered_rules,
            "messages": messages,
            "rule_engine_output": True
        }

    def get_missing_vitals(self, vitals: Dict) -> List[str]:
        """
        Identify missing vital signs

        Args:
            vitals: Dictionary of vitals

        Returns:
            List of missing vital names
        """
        required_vitals = ["spo2", "temperature", "systolic_bp", "diastolic_bp"]
        missing = []

        for vital in required_vitals:
            if vital not in vitals or vitals[vital] is None:
                missing.append(vital)

        return missing


# Global instance
rule_engine = RuleEngine()
