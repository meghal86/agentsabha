from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy import delete, select

from app.agents.zero_hour import ZeroHourAgent
from app.database import AsyncSessionLocal, engine
from app.models.agent_log import AgentLog
from app.models.cluster import ClusterSnapshot, IssueCluster
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction


LOCAL_CONSTITUENCY_ID = 13
COORDINATED_CONSTITUENCY_IDS = [14, 15, 16, 17, 18]


async def _cleanup(constituency_ids: list[int]) -> None:
    await engine.dispose()
    async with AsyncSessionLocal() as db:
        cluster_ids = list(await db.scalars(select(IssueCluster.id).where(IssueCluster.constituency_id.in_(constituency_ids))))
        if cluster_ids:
            await db.execute(delete(ClusterSnapshot).where(ClusterSnapshot.cluster_id.in_(cluster_ids)))
            await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.cluster_id.in_(cluster_ids)))
            await db.commit()
        await db.execute(delete(Issue).where(Issue.constituency_id.in_(constituency_ids)))
        await db.execute(delete(IssueCluster).where(IssueCluster.constituency_id.in_(constituency_ids)))
        await db.execute(delete(AgentLog).where(AgentLog.constituency_id.in_(constituency_ids)))
        await db.commit()
    await engine.dispose()


async def _seed_tatkal_cluster(constituency_id: int, *, label: str, issue_type: str = "water") -> None:
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        cluster = IssueCluster(
            constituency_id=constituency_id,
            label=label,
            category=issue_type,
            issue_count=60,
            severity_avg=Decimal("8.7"),
            velocity=Decimal("42.0"),
            badge="tatkal",
            first_seen=now - timedelta(hours=6),
            last_updated=now - timedelta(minutes=30),
        )
        db.add(cluster)
        await db.flush()

        for idx in range(60):
            db.add(
                Issue(
                    constituency_id=constituency_id,
                    cluster_id=cluster.id,
                    raw_text=f"{label} complaint {idx}",
                    translated_text=f"{label} complaint {idx}",
                    source_language="en",
                    source_channel="web",
                    issue_type=issue_type,
                    severity_score=Decimal("8.8"),
                    urgency_flag=True,
                    location_district="Test District",
                    location_ward=f"Ward {idx + 1}",
                    affected_estimate=180,
                    ministry_mapped="Ministry of Jal Shakti" if issue_type == "water" else "Ministry of Road Transport and Highways",
                    created_at=now - timedelta(hours=4),
                )
            )
        await db.commit()


@pytest.mark.asyncio
async def test_zero_hour_agent_generates_local_notice() -> None:
    await _cleanup([LOCAL_CONSTITUENCY_ID])
    try:
        await _seed_tatkal_cluster(LOCAL_CONSTITUENCY_ID, label="Acute water contamination emergency")

        async with AsyncSessionLocal() as db:
            result = await ZeroHourAgent().run(db, LOCAL_CONSTITUENCY_ID)
            assert result["notices_created"] == 1

            action = await db.scalar(
                select(ParliamentaryAction).where(
                    ParliamentaryAction.constituency_id == LOCAL_CONSTITUENCY_ID,
                    ParliamentaryAction.action_type == "zero_hour",
                )
            )
            assert action is not None
            assert action.status == "draft"
            assert "Subject:" in action.content
            assert "Filing deadline: 08:45 IST" in action.content
            metadata = next(citation for citation in action.source_citations if citation["type"] == "agent_metadata")
            assert metadata["coordinated"] is False
            assert metadata["citizen_count"] >= 50
    finally:
        await _cleanup([LOCAL_CONSTITUENCY_ID])


@pytest.mark.asyncio
async def test_zero_hour_agent_generates_coordinated_notice() -> None:
    await _cleanup(COORDINATED_CONSTITUENCY_IDS)
    try:
        for constituency_id in COORDINATED_CONSTITUENCY_IDS:
            await _seed_tatkal_cluster(constituency_id, label="Acute water contamination emergency")

        async with AsyncSessionLocal() as db:
            result = await ZeroHourAgent().run(db)
            assert result["coordinated_notices"] >= 1

            actions = (
                await db.execute(
                    select(ParliamentaryAction).where(ParliamentaryAction.action_type == "zero_hour")
                )
            ).scalars().all()
            assert len(actions) == 1
            metadata = next(citation for citation in actions[0].source_citations if citation["type"] == "agent_metadata")
            assert metadata["coordinated"] is True
            assert len(metadata["constituencies_affected"]) == 5
    finally:
        await _cleanup(COORDINATED_CONSTITUENCY_IDS)
