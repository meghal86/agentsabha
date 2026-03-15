from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_log import AgentLog
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.utils.audit_logger import AuditEntry, build_audit_payload
from app.utils.hashing import sha256_hex


@dataclass
class QuestionDraftAgent:
    model: str = "claude-sonnet-4-6"

    async def run(self, db: AsyncSession, constituency_id: int) -> dict:
        started = perf_counter()
        constituency = await db.scalar(select(Constituency).where(Constituency.id == constituency_id))
        if constituency is None:
            return {"constituency_id": constituency_id, "drafts_created": 0}

        clusters = (
            await db.execute(
                select(IssueCluster)
                .where(IssueCluster.constituency_id == constituency_id, IssueCluster.issue_count >= 10)
                .order_by(desc(IssueCluster.severity_avg), desc(IssueCluster.issue_count), desc(IssueCluster.last_updated))
                .limit(3)
            )
        ).scalars().all()

        drafts_created = 0
        for cluster in clusters:
            recent_issues = (
                await db.execute(
                    select(Issue)
                    .where(Issue.cluster_id == cluster.id)
                    .order_by(desc(Issue.created_at))
                    .limit(3)
                )
            ).scalars().all()
            if not recent_issues:
                continue

            action_type = "question_starred" if float(cluster.severity_avg or 0) >= 8 else "question_unstarred"
            ministry = recent_issues[0].ministry_mapped or "Concerned Ministry"
            citizen_count = cluster.issue_count
            citations = [
                {
                    "title": f"Verified citizen report {issue.id}",
                    "url": f"https://agentsabha.in/citations/issues/{issue.id}",
                    "type": "verified_citizen_report",
                    "date": issue.created_at.date().isoformat(),
                }
                for issue in recent_issues
            ]
            question_text = (
                f"Will the Minister of {ministry} be pleased to state:\n"
                f"(a) whether the Government has taken note of the '{cluster.label}' pattern reported from {constituency.name};\n"
                f"(b) whether {citizen_count} verified citizens from {constituency.name} have reported repeated instances linked to this issue cluster;\n"
                f"(c) the project, scheme, administrative action, or contract currently responsible for addressing this matter in the constituency;\n"
                f"(d) the timeline within which corrective action, monitoring, and public communication will be completed;\n\n"
                f"Constituency evidence: {citizen_count} verified citizens from {constituency.name} have reported this issue cluster.\n"
                f"Statutory hook: To be raised under Rule 32 of Lok Sabha Rules of Procedure."
            )

            existing_draft = await db.scalar(
                select(ParliamentaryAction)
                .where(
                    ParliamentaryAction.constituency_id == constituency_id,
                    ParliamentaryAction.cluster_id == cluster.id,
                    ParliamentaryAction.status.in_(("draft", "submitted_to_mp")),
                )
                .order_by(desc(ParliamentaryAction.created_at))
                .limit(1)
            )
            if existing_draft is None:
                existing_draft = ParliamentaryAction(
                    constituency_id=constituency_id,
                    cluster_id=cluster.id,
                    action_type=action_type,
                    content=question_text,
                    source_citations=citations,
                    ministry=ministry,
                    lok_sabha_rule="Rule 32",
                    status="draft",
                )
                db.add(existing_draft)
                drafts_created += 1
            else:
                existing_draft.action_type = action_type
                existing_draft.content = question_text
                existing_draft.source_citations = citations
                existing_draft.ministry = ministry
                existing_draft.lok_sabha_rule = "Rule 32"

        audit_payload = build_audit_payload(
            AuditEntry(
                agent_type="question_draft",
                constituency_id=constituency_id,
                action="draft_questions_generated",
                input_hash=sha256_hex(f"{constituency_id}:{len(clusters)}"),
                output_hash=sha256_hex(f"{constituency_id}:{drafts_created}"),
                model_version=self.model,
                tokens_used=0,
                latency_ms=int((perf_counter() - started) * 1000),
                error_code=None,
            )
        )
        db.add(AgentLog(**audit_payload))
        await db.commit()
        return {"constituency_id": constituency_id, "drafts_created": drafts_created}
