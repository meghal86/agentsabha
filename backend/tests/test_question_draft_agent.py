from __future__ import annotations

from decimal import Decimal

import pytest
from sqlalchemy import delete, select

from app.agents.clustering import ClusteringAgent
from app.agents.question_draft import QuestionDraftAgent
from app.database import AsyncSessionLocal, engine
from app.models.agent_log import AgentLog
from app.models.cluster import ClusterSnapshot, IssueCluster
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.services.source_retrieval import SourceRetrievalService


STARRED_CONSTITUENCY_ID = 4
UNSTARRED_CONSTITUENCY_ID = 5
BLOCKED_CONSTITUENCY_ID = 6
REVIEW_CONSTITUENCY_ID = 7


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


async def _seed_cluster(
    constituency_id: int,
    *,
    issue_type: str,
    severity: float,
    ministry: str | None,
    count: int = 10,
) -> None:
    async with AsyncSessionLocal() as db:
        for idx in range(count):
            db.add(
                Issue(
                    constituency_id=constituency_id,
                    raw_text=f"{issue_type} issue report {idx}",
                    translated_text=f"{issue_type} issue report {idx}",
                    source_language="en",
                    source_channel="web",
                    issue_type=issue_type,
                    severity_score=Decimal(str(severity)),
                    urgency_flag=severity >= 8,
                    location_district="Test District",
                    location_ward=f"Ward {idx + 1}",
                    affected_estimate=250,
                    ministry_mapped=ministry,
                )
            )
        await db.commit()
        await ClusteringAgent().run(db, constituency_id)


async def _seed_conflicted_cluster(constituency_id: int) -> None:
    async with AsyncSessionLocal() as db:
        ministries = [
            "Ministry of Jal Shakti",
            "Ministry of Rural Development",
            "Ministry of Jal Shakti",
            "Ministry of Rural Development",
            "Ministry of Jal Shakti",
            "Ministry of Rural Development",
            "Ministry of Jal Shakti",
            "Ministry of Rural Development",
            "Ministry of Jal Shakti",
            "Ministry of Rural Development",
        ]
        for idx, ministry in enumerate(ministries):
            db.add(
                Issue(
                    constituency_id=constituency_id,
                    raw_text=f"Flooded low-lying road and blocked drains report {idx}",
                    translated_text=f"Flooded low-lying road and blocked drains report {idx}",
                    source_language="en",
                    source_channel="web",
                    issue_type="water",
                    severity_score=Decimal("7.8"),
                    urgency_flag=True,
                    location_district="Test District",
                    location_ward=f"Ward {idx + 1}",
                    affected_estimate=300,
                    ministry_mapped=ministry,
                )
            )
        await db.commit()
        await ClusteringAgent().run(db, constituency_id)


@pytest.fixture(autouse=True)
def stub_source_retrieval(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_retrieve_primary_source(self, *, category: str | None, ministry: str | None = None, label: str | None = None):
        return {
            "title": f"Live source for {category or 'other'}",
            "url": f"https://example.gov/{category or 'other'}",
            "type": "government_record",
            "date": "2026-03-20",
            "retrieval_status": "live",
            "source_domain": "example.gov",
        }

    monkeypatch.setattr(SourceRetrievalService, "retrieve_primary_source", fake_retrieve_primary_source)


@pytest.mark.asyncio
async def test_question_draft_agent_generates_starred_question_with_sources() -> None:
    await _cleanup(STARRED_CONSTITUENCY_ID)
    try:
        await _seed_cluster(
            STARRED_CONSTITUENCY_ID,
            issue_type="road",
            severity=8.7,
            ministry="Ministry of Road Transport and Highways",
            count=10,
        )

        async with AsyncSessionLocal() as db:
            result = await QuestionDraftAgent().run(db, STARRED_CONSTITUENCY_ID)
            assert result["drafts_created"] >= 1

            action = await db.scalar(
                select(ParliamentaryAction).where(ParliamentaryAction.constituency_id == STARRED_CONSTITUENCY_ID)
            )
            assert action is not None
            assert action.action_type == "question_starred"
            assert action.lok_sabha_rule == "Rule 32"
            assert "(a)" in action.content
            assert "(d)" in action.content
            assert "verified citizens" in action.content
            assert action.source_citations is not None
            assert action.source_citations[0]["type"] == "government_record"
            assert action.source_citations[0]["retrieval_status"] == "live"
            assert len(action.source_citations) >= 5
    finally:
        await _cleanup(STARRED_CONSTITUENCY_ID)


@pytest.mark.asyncio
async def test_question_draft_agent_generates_unstarred_question_under_rule_33() -> None:
    await _cleanup(UNSTARRED_CONSTITUENCY_ID)
    try:
        await _seed_cluster(
            UNSTARRED_CONSTITUENCY_ID,
            issue_type="water",
            severity=5.6,
            ministry="Ministry of Jal Shakti",
            count=10,
        )

        async with AsyncSessionLocal() as db:
            result = await QuestionDraftAgent().run(db, UNSTARRED_CONSTITUENCY_ID)
            assert result["drafts_created"] >= 1

            action = await db.scalar(
                select(ParliamentaryAction).where(ParliamentaryAction.constituency_id == UNSTARRED_CONSTITUENCY_ID)
            )
            assert action is not None
            assert action.action_type == "question_unstarred"
            assert action.lok_sabha_rule == "Rule 33"
            assert "(a)" in action.content
            assert "(c)" in action.content
            assert "(d)" not in action.content
            assert "Rule 33" in action.content
    finally:
        await _cleanup(UNSTARRED_CONSTITUENCY_ID)


@pytest.mark.asyncio
async def test_question_draft_agent_skips_cluster_when_ministry_is_uncertain() -> None:
    await _cleanup(BLOCKED_CONSTITUENCY_ID)
    try:
        await _seed_cluster(
            BLOCKED_CONSTITUENCY_ID,
            issue_type="health",
            severity=8.3,
            ministry=None,
            count=10,
        )

        async with AsyncSessionLocal() as db:
            result = await QuestionDraftAgent().run(db, BLOCKED_CONSTITUENCY_ID)
            assert result["drafts_created"] == 0
            assert result["reviews_needed"] == 1

            action = await db.scalar(
                select(ParliamentaryAction).where(ParliamentaryAction.constituency_id == BLOCKED_CONSTITUENCY_ID)
            )
            assert action is not None
            assert action.status == "needs_review"
            assert "requires review before filing" in action.content
            assert action.ministry is None
    finally:
        await _cleanup(BLOCKED_CONSTITUENCY_ID)


@pytest.mark.asyncio
async def test_question_draft_agent_marks_conflicting_ministry_evidence_for_review() -> None:
    await _cleanup(REVIEW_CONSTITUENCY_ID)
    try:
        await _seed_conflicted_cluster(REVIEW_CONSTITUENCY_ID)

        async with AsyncSessionLocal() as db:
            result = await QuestionDraftAgent().run(db, REVIEW_CONSTITUENCY_ID)
            assert result["drafts_created"] == 0
            assert result["reviews_needed"] == 1

            action = await db.scalar(
                select(ParliamentaryAction).where(ParliamentaryAction.constituency_id == REVIEW_CONSTITUENCY_ID)
            )
            assert action is not None
            assert action.status == "needs_review"
            assert "multiple ministries" in action.content.lower()
            assert action.source_citations is not None
            assert action.source_citations[1]["type"] == "cluster_snapshot"
    finally:
        await _cleanup(REVIEW_CONSTITUENCY_ID)
