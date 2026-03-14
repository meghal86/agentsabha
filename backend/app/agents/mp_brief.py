from dataclasses import dataclass


@dataclass
class MPBriefAgent:
    model: str = "claude-sonnet-4-6"

    async def run(self, constituency_id: int) -> dict:
        return {"constituency_id": constituency_id, "brief_generated": False}
