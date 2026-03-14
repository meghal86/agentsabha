from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path


ISSUE_KEYWORDS = {
    "road": ("road", "roads", "pothole", "street", "bridge", "sarak", "sadak", "asphalt"),
    "water": ("water", "tap", "drinking", "pipeline", "pipe", "borewell", "paani", "jal", "sewage"),
    "power": ("power", "electricity", "transformer", "voltage", "meter", "bijli", "light", "streetlight"),
    "health": ("hospital", "health", "doctor", "medicine", "ambulance", "phc", "clinic", "vaccination"),
    "education": ("school", "teacher", "classroom", "textbook", "student", "education", "anganwadi"),
    "employment": ("employment", "job", "mgnrega", "wage", "skill", "payment", "rozgaar"),
    "housing": ("housing", "house", "home", "toilet", "drainage", "flooding", "makaan"),
    "environment": ("garbage", "waste", "pollution", "drain", "sewage", "air", "sanitation"),
}

MINISTRY_MAP = {
    "road": "Ministry of Road Transport and Highways",
    "water": "Ministry of Jal Shakti",
    "power": "Ministry of Power",
    "health": "Ministry of Health and Family Welfare",
    "education": "Ministry of Education",
    "employment": "Ministry of Labour and Employment",
    "housing": "Ministry of Housing and Urban Affairs",
    "environment": "Ministry of Environment, Forest and Climate Change",
    "other": None,
}

DISTRICT_HINTS = ("district", "nagar", "ward", "village", "colony", "block")


@dataclass
class IntakeAgent:
    model: str = "claude-haiku-4-5"

    async def run(self, text: str, metadata: dict | None = None) -> dict:
        prompt_path = Path(__file__).with_name("prompts") / "intake_extract.txt"
        _ = prompt_path.read_text(encoding="utf-8")
        normalized = text.lower()
        issue_type = "other"
        for candidate, keywords in ISSUE_KEYWORDS.items():
            if any(keyword in normalized for keyword in keywords):
                issue_type = candidate
                break

        severity = Decimal("5.0")
        if any(keyword in normalized for keyword in ("accident", "ambulance", "emergency", "children fell", "life", "burned")):
            severity = Decimal("8.8")
        elif any(keyword in normalized for keyword in ("daily", "every day", "weeks", "months", "stopped completely", "overflowing")):
            severity = Decimal("7.2")
        elif any(keyword in normalized for keyword in ("soon", "minor", "small", "sometimes")):
            severity = Decimal("3.5")

        urgency_flag = severity >= Decimal("8.0")
        location_district = None
        location_ward = None
        for hint in DISTRICT_HINTS:
            if hint in normalized:
                location_district = metadata.get("location") if metadata else None
                break
        if "ward" in normalized and metadata and metadata.get("location"):
            location_ward = metadata["location"]

        return {
            "issue_type": issue_type,
            "severity_score": severity,
            "location_district": location_district,
            "location_ward": location_ward,
            "urgency_flag": urgency_flag,
            "affected_estimate": 50 if urgency_flag else 10,
            "ministry_mapped": MINISTRY_MAP[issue_type],
            "raw_text": text,
            "metadata": metadata or {},
        }
