from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class IntakeAgent:
    model: str = "claude-haiku-4-5"

    async def run(self, text: str, metadata: dict | None = None) -> dict:
        return {
            "issue_type": "other",
            "severity_score": 5.0,
            "location_district": None,
            "location_ward": None,
            "urgency_flag": False,
            "affected_estimate": None,
            "ministry_mapped": None,
            "raw_text": text,
            "metadata": metadata or {},
        }
