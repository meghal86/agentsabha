from dataclasses import dataclass


@dataclass
class ClusteringAgent:
    async def run(self, constituency_id: int) -> dict:
        return {"constituency_id": constituency_id, "clusters_updated": 0}
