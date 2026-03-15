from __future__ import annotations

from pathlib import Path
from uuid import UUID

import pytest
from sqlalchemy import delete, select

from app.agents.clustering import ClusteringAgent
from app.agents.mp_brief import MPBriefAgent
from app.agents.question_draft import QuestionDraftAgent
from app.database import AsyncSessionLocal, engine
from app.models.agent_log import AgentLog
from app.models.cluster import ClusterSnapshot, IssueCluster
from app.models.issue import Issue
from app.models.mp_brief import MPBrief
from app.models.parliamentary_action import ParliamentaryAction


TEST_CONSTITUENCY_ID = 3


async def _cleanup() -> None:
    await engine.dispose()
    async with AsyncSessionLocal() as db:
        cluster_ids = list(
            await db.scalars(select(IssueCluster.id).where(IssueCluster.constituency_id == TEST_CONSTITUENCY_ID))
        )
        if cluster_ids:
            await db.execute(delete(ClusterSnapshot).where(ClusterSnapshot.cluster_id.in_(cluster_ids)))
            await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.cluster_id.in_(cluster_ids)))
            await db.commit()
        await db.execute(delete(MPBrief).where(MPBrief.constituency_id == TEST_CONSTITUENCY_ID))
        await db.execute(delete(Issue).where(Issue.constituency_id == TEST_CONSTITUENCY_ID))
        await db.execute(delete(IssueCluster).where(IssueCluster.constituency_id == TEST_CONSTITUENCY_ID))
        await db.execute(delete(AgentLog).where(AgentLog.constituency_id == TEST_CONSTITUENCY_ID))
        await db.commit()
    await engine.dispose()


@pytest.mark.asyncio
async def test_clustering_question_and_brief_pipeline() -> None:
    await _cleanup()
    pdf_path: Path | None = None

    try:
        async with AsyncSessionLocal() as db:
            issues = []
            for idx in range(10):
                issue = Issue(
                    constituency_id=TEST_CONSTITUENCY_ID,
                    raw_text=f"Road outside school sector is broken and unsafe for children report {idx}",
                    translated_text=f"Road outside school sector is broken and unsafe for children report {idx}",
                    source_language="en",
                    source_channel="web",
                    issue_type="road",
                    severity_score=8.4,
                    urgency_flag=True,
                    location_district="Test District",
                    location_ward=f"Ward {idx + 1}",
                    affected_estimate=120,
                    ministry_mapped="Ministry of Road Transport and Highways",
                )
                db.add(issue)
                issues.append(issue)
            await db.commit()

            clustering = await ClusteringAgent().run(db, TEST_CONSTITUENCY_ID)
            assert clustering["clusters_updated"] >= 1

            cluster = await db.scalar(select(IssueCluster).where(IssueCluster.constituency_id == TEST_CONSTITUENCY_ID))
            assert cluster is not None
            assert cluster.category == "road"
            assert cluster.issue_count >= 10

            clustered_issues = (
                await db.execute(select(Issue).where(Issue.constituency_id == TEST_CONSTITUENCY_ID))
            ).scalars().all()
            assert all(issue.cluster_id == cluster.id for issue in clustered_issues)

            drafted = await QuestionDraftAgent().run(db, TEST_CONSTITUENCY_ID)
            assert drafted["drafts_created"] >= 1

            action = await db.scalar(
                select(ParliamentaryAction).where(ParliamentaryAction.constituency_id == TEST_CONSTITUENCY_ID)
            )
            assert action is not None
            assert action.status == "draft"
            assert action.lok_sabha_rule == "Rule 32"
            assert "Will the Minister" in action.content

            brief_result = await MPBriefAgent().run(db, TEST_CONSTITUENCY_ID)
            assert brief_result["brief_generated"] is True

            brief = await db.scalar(select(MPBrief).where(MPBrief.constituency_id == TEST_CONSTITUENCY_ID))
            assert brief is not None
            assert brief.brief_content is not None
            assert brief.brief_pdf_url is not None
            pdf_path = Path(brief.brief_pdf_url)
            assert pdf_path.exists()
    finally:
        await _cleanup()
        if pdf_path and pdf_path.exists():
            pdf_path.unlink()
