from __future__ import annotations

import json
import re
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

from anthropic import AsyncAnthropic

from app.config import get_settings

ISSUE_KEYWORDS = {
    "road": ("road", "roads", "pothole", "street", "bridge", "sarak", "sadak", "asphalt", "highway", "nh-"),
    "water": ("water", "tap", "drinking", "pipeline", "pipe", "borewell", "paani", "jal", "sewage", "drainage"),
    "power": ("power", "electricity", "transformer", "voltage", "meter", "bijli", "light", "streetlight", "outage"),
    "health": ("hospital", "health", "doctor", "medicine", "ambulance", "phc", "clinic", "vaccination", "fever"),
    "education": ("school", "teacher", "classroom", "textbook", "student", "education", "anganwadi", "college"),
    "employment": ("employment", "job", "mgnrega", "wage", "skill", "payment", "rozgaar", "work", "salary"),
    "housing": ("housing", "house", "home", "toilet", "makaan", "roof", "drainage", "flooding", "shelter"),
    "environment": ("garbage", "waste", "pollution", "drain", "air", "smoke", "sanitation", "sewage", "dump"),
}

MINISTRY_MAP = {
    "road": "Ministry of Road Transport and Highways",
    "water": "Ministry of Jal Shakti",
    "power": "Ministry of Power",
    "health": "Ministry of Health and Family Welfare",
    "education": "Ministry of Education",
    "employment": "Ministry of Rural Development",
    "housing": "Ministry of Housing and Urban Affairs",
    "environment": "Ministry of Environment Forest and Climate Change",
    "other": None,
}

WARD_MARKERS = ("ward", "village", "taluk", "taluq", "colony", "block", "mohalla", "nagar", "sector", "panchayat")
URGENCY_TERMS = (
    "accident",
    "injured",
    "injury",
    "death",
    "died",
    "collapsed",
    "ambulance",
    "emergency",
    "electrocuted",
    "poisoned",
    "contamination",
    "unsafe",
    "children fell",
    "school children",
    "life risk",
    "medical emergency",
)
HIGH_SEVERITY_TERMS = ("daily", "every day", "3 months", "6 months", "stopped completely", "overflowing", "no water", "no electricity")
LOW_SEVERITY_TERMS = ("sometimes", "occasionally", "minor", "small", "a little")


class IntakeAgent:
    model = "claude-haiku-4-5"

    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = AsyncAnthropic(api_key=self.settings.anthropic_api_key) if self.settings.anthropic_api_key else None

    async def run(self, text: str, metadata: dict | None = None) -> dict:
        metadata = metadata or {}
        prompt = self._prompt_text()
        normalized_text = " ".join(text.split()).strip()
        if not normalized_text:
            normalized_text = text.strip()

        if self.client is not None and normalized_text:
            try:
                response = await self.client.messages.create(
                    model=self.model,
                    system=prompt,
                    max_tokens=400,
                    temperature=0,
                    messages=[
                        {
                            "role": "user",
                            "content": json.dumps(
                                {
                                    "translated_text": normalized_text,
                                    "source_channel": metadata.get("channel"),
                                    "constituency_id": metadata.get("constituency_id"),
                                    "source_language": metadata.get("language"),
                                },
                                ensure_ascii=False,
                            ),
                        }
                    ],
                )
                llm_payload = self._extract_json_payload(response)
                return self._normalize_payload(llm_payload, normalized_text, metadata)
            except Exception:
                pass

        return self._fallback_extract(normalized_text, metadata)

    def _prompt_text(self) -> str:
        prompt_path = Path(__file__).with_name("prompts") / "intake_extract.txt"
        return prompt_path.read_text(encoding="utf-8")

    def _extract_json_payload(self, response: Any) -> dict[str, Any]:
        text_blocks: list[str] = []
        for block in getattr(response, "content", []) or []:
            if getattr(block, "type", None) == "text":
                text_blocks.append(block.text)
        raw = "\n".join(text_blocks).strip()
        if not raw:
            raise ValueError("Empty LLM response")

        if raw.startswith("```"):
            raw = raw.strip("`")
            raw = raw.replace("json\n", "", 1).strip()

        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise ValueError("No JSON object found in LLM response")

        return json.loads(raw[start : end + 1])

    def _fallback_extract(self, text: str, metadata: dict[str, Any]) -> dict[str, Any]:
        issue_type = self._detect_issue_type(text)
        severity = self._estimate_severity(text)
        urgency_flag = severity >= Decimal("8.0")
        location_district, location_ward = self._extract_locations(text, metadata)
        affected_estimate = self._estimate_affected_people(text, urgency_flag)
        ministry = MINISTRY_MAP.get(issue_type)
        summary = self._build_issue_summary(text, issue_type)

        return {
            "issue_type": issue_type,
            "severity_score": severity,
            "location_district": location_district,
            "location_ward": location_ward,
            "urgency_flag": urgency_flag,
            "affected_estimate": affected_estimate,
            "ministry_mapped": ministry,
            "issue_summary": summary,
            "raw_text": text,
            "metadata": metadata,
        }

    def _normalize_payload(self, payload: dict[str, Any], text: str, metadata: dict[str, Any]) -> dict[str, Any]:
        fallback = self._fallback_extract(text, metadata)

        issue_type = payload.get("issue_type") or fallback["issue_type"]
        if issue_type not in MINISTRY_MAP:
            issue_type = fallback["issue_type"]

        severity_value = self._coerce_decimal(payload.get("severity_score"), fallback["severity_score"])
        urgency_flag = bool(payload.get("urgency_flag")) if payload.get("urgency_flag") is not None else severity_value >= Decimal("8.0")
        location_district = self._clean_string(payload.get("location_district")) or fallback["location_district"]
        location_ward = self._clean_string(payload.get("location_ward")) or fallback["location_ward"]
        affected_estimate = self._coerce_int(payload.get("affected_estimate"), fallback["affected_estimate"])
        ministry_mapped = self._clean_string(payload.get("ministry_mapped")) or MINISTRY_MAP.get(issue_type) or fallback["ministry_mapped"]
        issue_summary = self._clean_string(payload.get("issue_summary")) or fallback["issue_summary"]

        return {
            "issue_type": issue_type,
            "severity_score": severity_value,
            "location_district": location_district,
            "location_ward": location_ward,
            "urgency_flag": urgency_flag,
            "affected_estimate": affected_estimate,
            "ministry_mapped": ministry_mapped,
            "issue_summary": issue_summary,
            "raw_text": text,
            "metadata": metadata,
        }

    def _detect_issue_type(self, text: str) -> str:
        normalized = text.lower()
        scores: dict[str, int] = {}
        for candidate, keywords in ISSUE_KEYWORDS.items():
            scores[candidate] = sum(1 for keyword in keywords if keyword in normalized)

        winner = max(scores, key=scores.get)
        if scores[winner] == 0:
            return "other"
        return winner

    def _estimate_severity(self, text: str) -> Decimal:
        normalized = text.lower()
        severity = Decimal("5.0")

        if any(term in normalized for term in URGENCY_TERMS):
            severity = Decimal("8.4")
        elif any(term in normalized for term in HIGH_SEVERITY_TERMS):
            severity = Decimal("7.0")
        elif any(term in normalized for term in LOW_SEVERITY_TERMS):
            severity = Decimal("3.5")

        if "years" in normalized or "year" in normalized:
            severity += Decimal("0.4")
        elif "months" in normalized or "month" in normalized:
            severity += Decimal("0.2")

        return min(max(severity, Decimal("1.0")), Decimal("10.0")).quantize(Decimal("0.1"))

    def _extract_locations(self, text: str, metadata: dict[str, Any]) -> tuple[str | None, str | None]:
        location_district = None
        location_ward = None

        location_hint = self._clean_string(metadata.get("location"))
        if location_hint:
            location_ward = location_hint

        district_match = re.search(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+district\b", text)
        if district_match:
            location_district = district_match.group(1).strip()

        locality_match = re.search(
            r"\b(?:ward|village|taluk|taluq|colony|sector|mohalla|block|panchayat)\s+([A-Z0-9][A-Za-z0-9\-\s]+)",
            text,
            re.IGNORECASE,
        )
        if locality_match:
            location_ward = locality_match.group(0).strip()
        else:
            named_locality_match = re.search(
                r"\b([A-Z][A-Za-z0-9\-\s]+)\s+(ward|village|taluk|taluq|colony|sector|mohalla|block|panchayat)\b",
                text,
            )
            if named_locality_match:
                location_ward = f"{named_locality_match.group(1).strip()} {named_locality_match.group(2).strip()}"

        if location_district is None:
            in_match = re.search(r"\b(?:in|near|outside)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})", text)
            if in_match:
                candidate = in_match.group(1).strip()
                if not any(marker in candidate.lower() for marker in WARD_MARKERS):
                    location_district = candidate

        return location_district, location_ward

    def _estimate_affected_people(self, text: str, urgency_flag: bool) -> int | None:
        normalized = text.lower()
        family_match = re.search(r"(\d[\d,]*)\s+(?:families|households)", normalized)
        if family_match:
            families = int(family_match.group(1).replace(",", ""))
            return families * 5

        people_match = re.search(r"(\d[\d,]*)\s+(?:people|citizens|residents|children|students|workers)", normalized)
        if people_match:
            return int(people_match.group(1).replace(",", ""))

        count_match = re.search(r"(\d[\d,]*)", normalized)
        if count_match and any(term in normalized for term in ("affected", "reports", "complaints")):
            return int(count_match.group(1).replace(",", ""))

        return 200 if urgency_flag else 25

    def _build_issue_summary(self, text: str, issue_type: str) -> str:
        sentence = re.split(r"(?<=[.!?])\s+", text.strip())[0].strip()
        if sentence:
            return sentence[:180]
        if issue_type == "other":
            return "Citizen reported a local civic issue requiring review."
        return f"Citizen reported a {issue_type} issue requiring attention."

    def _coerce_decimal(self, value: Any, fallback: Decimal) -> Decimal:
        if value is None:
            return fallback
        try:
            numeric = Decimal(str(value))
        except (InvalidOperation, ValueError):
            return fallback
        numeric = min(max(numeric, Decimal("1.0")), Decimal("10.0"))
        return numeric.quantize(Decimal("0.1"))

    def _coerce_int(self, value: Any, fallback: int | None) -> int | None:
        if value is None:
            return fallback
        try:
            return max(int(value), 0)
        except (TypeError, ValueError):
            return fallback

    def _clean_string(self, value: Any) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        return text or None
