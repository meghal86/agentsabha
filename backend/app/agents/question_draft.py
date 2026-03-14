from dataclasses import dataclass


@dataclass
class QuestionDraftAgent:
    model: str = "claude-sonnet-4-6"

    async def run(self, constituency_id: int) -> dict:
        return {"constituency_id": constituency_id, "drafts_created": 0}
