from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy import delete, select

from app.agents.clustering import ClusteringAgent
from app.database import AsyncSessionLocal, engine
from app.models.agent_log import AgentLog
from app.models.cluster import ClusterSnapshot, IssueCluster
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction


RESOLVED_CONSTITUENCY_ID = 10
CHRONIC_CONSTITUENCY_ID = 11


async def _cleanup(constituency_id: int) -> None:
    await engine.dispose()
    async with AsyncSessionLocal() as db:
        cluster_ids = list(await db.scalars(select(IssueCluster.id).where(IssueCluster.constituency_id == constituency_id)))
        if cluster_ids:
            await db.execute(delete(ClusterSnapshot).where(ClusterSnapshot.cluster_id.in_(cluster_ids)))
            await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.cluster_id.in_(cluster_ids)))
            await db.commit()
        await db.execute(delete(Issue).where(Issue.constituency_id == constituency_id))
        await db.execute(delete(IssueCluster).where(IssueCluster.constituency_id == constituency_id))
        await db.execute(delete(AgentLog).where(AgentLog.constituency_id == constituency_id))
        await db.commit()
    await engine.dispose()


async def _seed_existing_cluster(
    constituency_id: int,
    *,
    first_seen_days_ago: int,
    with_response: bool,
) -> None:
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        cluster = IssueCluster(
            constituency_id=constituency_id,
            label="Water supply disruption",
            category="water",
            issue_count=10,
            severity_avg=Decimal("6.5"),
            velocity=Decimal("10.0"),
            badge="stable",
            first_seen=now - timedelta(days=first_seen_days_ago),
            last_updated=now - timedelta(days=1),
        )
        db.add(cluster)
        await db.flush()

        for idx in range(10):
            db.add(
                Issue(
                    constituency_id=constituency_id,
                    cluster_id=cluster.id,
                    raw_text=f"Water supply disruption report {idx}",
                    translated_text=f"Water supply disruption report {idx}",
                    source_language="en",
                    source_channel="web",
                    issue_type="water",
                    severity_score=Decimal("6.5"),
                    urgency_flag=False,
                    location_district="Test District",
                    location_ward=f"Ward {idx + 1}",
                    affected_estimate=120,
                    ministry_mapped="Ministry of Jal Shakti",
                    created_at=now - timedelta(hours=3),
                )
            )

        if with_response:
            db.add(
                ParliamentaryAction(
                    constituency_id=constituency_id,
                    cluster_id=cluster.id,
                    action_type="question_unstarred",
                    content="Question draft",
                    ministry="Ministry of Jal Shakti",
                    lok_sabha_rule="Rule 33",
                    status="response_received",
                    response_text="Ministry has confirmed repair action.",
                    response_received=now - timedelta(hours=1),
                )
            )

        await db.commit()


@pytest.mark.asyncio
async def test_clustering_agent_sets_resolved_badge_when_response_received() -> None:
    await _cleanup(RESOLVED_CONSTITUENCY_ID)
    try:
        await _seed_existing_cluster(RESOLVED_CONSTITUENCY_ID, first_seen_days_ago=40, with_response=True)
        async with AsyncSessionLocal() as db:
            result = await ClusteringAgent().run(db, RESOLVED_CONSTITUENCY_ID)
            assert result["clusters_updated"] >= 1

            cluster = await db.scalar(select(IssueCluster).where(IssueCluster.constituency_id == RESOLVED_CONSTITUENCY_ID))
            assert cluster is not None
            assert cluster.badge == "resolved"
    finally:
        await _cleanup(RESOLVED_CONSTITUENCY_ID)


@pytest.mark.asyncio
async def test_clustering_agent_keeps_old_cluster_chronic_without_response() -> None:
    await _cleanup(CHRONIC_CONSTITUENCY_ID)
    try:
        await _seed_existing_cluster(CHRONIC_CONSTITUENCY_ID, first_seen_days_ago=40, with_response=False)
        async with AsyncSessionLocal() as db:
            result = await ClusteringAgent().run(db, CHRONIC_CONSTITUENCY_ID)
            assert result["clusters_updated"] >= 1

            cluster = await db.scalar(select(IssueCluster).where(IssueCluster.constituency_id == CHRONIC_CONSTITUENCY_ID))
            assert cluster is not None
            assert cluster.badge == "chronic"
    finally:
        await _cleanup(CHRONIC_CONSTITUENCY_ID)
