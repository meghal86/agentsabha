from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from time import perf_counter

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_log import AgentLog
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.services.source_retrieval import SourceRetrievalService
from app.utils.audit_logger import AuditEntry, build_audit_payload
from app.utils.hashing import sha256_hex

MIN_VERIFIED_REPORTS = 10
HIGH_PRIORITY_BADGES = {"tatkal", "rising"}


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
                .where(IssueCluster.constituency_id == constituency_id, IssueCluster.issue_count >= MIN_VERIFIED_REPORTS)
                .order_by(desc(IssueCluster.severity_avg), desc(IssueCluster.issue_count), desc(IssueCluster.last_updated))
                .limit(3)
            )
        ).scalars().all()

        drafts_created = 0
        reviews_needed = 0
        for cluster in clusters:
            recent_issues = (
                await db.execute(
                    select(Issue)
                    .where(Issue.cluster_id == cluster.id)
                    .order_by(desc(Issue.created_at))
                    .limit(10)
                )
            ).scalars().all()
            if len(recent_issues) < min(3, MIN_VERIFIED_REPORTS) or cluster.issue_count < MIN_VERIFIED_REPORTS:
                continue

            action_type = self._question_type(cluster)
            rule = "Rule 32" if action_type == "question_starred" else "Rule 33"
            citizen_count = int(cluster.issue_count or 0)
            label = (cluster.label or cluster.category or "constituency grievance").strip()
            evidence_summary = self._build_evidence_summary(recent_issues)
            cluster_citation = self._cluster_citation(cluster, constituency.name)
            ministry_resolution = self._resolve_ministry(recent_issues)
            status = "draft"
            ministry = ministry_resolution["ministry"]
            statutory_hook = await SourceRetrievalService().retrieve_primary_source(
                category=cluster.category,
                ministry=ministry,
                label=label,
            )
            citations = [statutory_hook, cluster_citation, *self._issue_citations(recent_issues)]
            if ministry is None:
                status = "needs_review"
                question_text = self._build_review_text(
                    rule=rule,
                    constituency_name=constituency.name,
                    label=label,
                    citizen_count=citizen_count,
                    evidence_summary=evidence_summary,
                    suggested_ministries=ministry_resolution["candidates"],
                    review_reason=ministry_resolution["reason"] or "Ministry mapping is uncertain.",
                )
                reviews_needed += 1
            else:
                question_text = self._build_question_text(
                    action_type=action_type,
                    rule=rule,
                    ministry=ministry,
                    constituency_name=constituency.name,
                    label=label,
                    citizen_count=citizen_count,
                    evidence_summary=evidence_summary,
                    statutory_hook=statutory_hook["title"],
                )

            existing_draft = await db.scalar(
                select(ParliamentaryAction)
                .where(
                    ParliamentaryAction.constituency_id == constituency_id,
                    ParliamentaryAction.cluster_id == cluster.id,
                    ParliamentaryAction.status.in_(("draft", "submitted_to_mp", "needs_review")),
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
                    lok_sabha_rule=rule,
                    status=status,
                )
                db.add(existing_draft)
                if status == "draft":
                    drafts_created += 1
            else:
                existing_draft.action_type = action_type
                existing_draft.content = question_text
                existing_draft.source_citations = citations
                existing_draft.ministry = ministry
                existing_draft.lok_sabha_rule = rule
                existing_draft.status = status

        audit_payload = build_audit_payload(
            AuditEntry(
                agent_type="question_draft",
                constituency_id=constituency_id,
                action="draft_questions_generated",
                input_hash=sha256_hex(f"{constituency_id}:{len(clusters)}"),
                output_hash=sha256_hex(f"{constituency_id}:{drafts_created}:{reviews_needed}"),
                model_version=self.model,
                tokens_used=0,
                latency_ms=int((perf_counter() - started) * 1000),
                error_code=None,
            )
        )
        db.add(AgentLog(**audit_payload))
        await db.commit()
        return {"constituency_id": constituency_id, "drafts_created": drafts_created, "reviews_needed": reviews_needed}

    def _question_type(self, cluster: IssueCluster) -> str:
        severity = float(cluster.severity_avg or 0)
        badge = (cluster.badge or "").strip().lower()
        if severity >= 8 or (severity >= 7.5 and badge in HIGH_PRIORITY_BADGES):
            return "question_starred"
        return "question_unstarred"

    def _resolve_ministry(self, issues: list[Issue]) -> dict[str, object]:
        ministry_counter = Counter(issue.ministry_mapped.strip() for issue in issues if issue.ministry_mapped)
        if not ministry_counter:
            return {"ministry": None, "candidates": [], "reason": "No ministry mapping is present in the current evidence."}
        ministry, count = ministry_counter.most_common(1)[0]
        if ministry.lower() in {"concerned ministry", "unknown", "needs review"}:
            return {"ministry": None, "candidates": [ministry], "reason": "The most common ministry mapping is still unresolved."}
        total = sum(ministry_counter.values())
        confidence = count / max(total, 1)
        candidates = [name for name, _ in ministry_counter.most_common(3)]
        if confidence < 0.6 and len(ministry_counter) > 1:
            return {
                "ministry": None,
                "candidates": candidates,
                "reason": "Citizen evidence points to multiple ministries and needs human review before filing.",
            }
        return {"ministry": ministry, "candidates": candidates, "reason": None}

    def _cluster_citation(self, cluster: IssueCluster, constituency_name: str) -> dict[str, str]:
        return {
            "title": f"Issue cluster '{cluster.label or cluster.category or 'constituency grievance'}' in {constituency_name}",
            "url": f"https://agentsabha.in/citations/clusters/{cluster.id}",
            "type": "cluster_snapshot",
            "date": cluster.last_updated.date().isoformat(),
        }

    def _issue_citations(self, issues: list[Issue]) -> list[dict[str, str]]:
        citations: list[dict[str, str]] = []
        for issue in issues[:3]:
            citations.append(
                {
                    "title": f"Verified citizen report from {issue.location_ward or issue.location_district or 'reported location'}",
                    "url": f"https://agentsabha.in/citations/issues/{issue.id}",
                    "type": "verified_citizen_report",
                    "date": issue.created_at.date().isoformat(),
                }
            )
        return citations

    def _build_evidence_summary(self, issues: list[Issue]) -> str:
        locations = [issue.location_ward or issue.location_district for issue in issues if issue.location_ward or issue.location_district]
        if not locations:
            return "multiple wards in the constituency"
        ordered = list(dict.fromkeys(locations))
        if len(ordered) == 1:
            return ordered[0]
        if len(ordered) == 2:
            return f"{ordered[0]} and {ordered[1]}"
        return f"{ordered[0]}, {ordered[1]}, and adjoining wards"

    def _build_question_text(
        self,
        *,
        action_type: str,
        rule: str,
        ministry: str,
        constituency_name: str,
        label: str,
        citizen_count: int,
        evidence_summary: str,
        statutory_hook: str,
    ) -> str:
        opening = f"Will the Minister of {ministry} be pleased to state:"
        if action_type == "question_starred":
            body = [
                f"(a) whether the Government has taken note of the recurring problem of {label} in {constituency_name};",
                f"(b) whether {citizen_count} verified citizens from {constituency_name} have reported the issue across {evidence_summary};",
                f"(c) the project, contract, scheme, or maintenance mechanism currently responsible for resolving this matter in the constituency; and",
                f"(d) the time-bound corrective action, monitoring schedule, and accountability measures proposed by the Ministry;",
            ]
        else:
            body = [
                f"(a) whether the Government has reviewed reports of {label} in {constituency_name};",
                f"(b) whether {citizen_count} verified citizen reports have been recorded across {evidence_summary}; and",
                f"(c) the scheme-wise or project-wise action plan and timeline proposed to address the matter;",
            ]

        evidence_line = (
            f"Constituency evidence: {citizen_count} verified citizens from {constituency_name} have reported this cluster."
        )
        hook_line = f"Statutory hook: {statutory_hook}."
        footer = f"To be raised under {rule} of the Rules of Procedure and Conduct of Business in Lok Sabha."
        return "\n".join([opening, *body, "", evidence_line, hook_line, footer])

    def _build_review_text(
        self,
        *,
        rule: str,
        constituency_name: str,
        label: str,
        citizen_count: int,
        evidence_summary: str,
        suggested_ministries: list[str],
        review_reason: str,
    ) -> str:
        candidate_line = (
            f"Suggested ministries for review: {', '.join(suggested_ministries)}."
            if suggested_ministries
            else "Suggested ministries for review: none confidently identified."
        )
        return "\n".join(
            [
                "Question draft requires review before filing.",
                f"Proposed subject: {label} in {constituency_name}.",
                f"Constituency evidence: {citizen_count} verified citizens from {constituency_name} have reported the issue across {evidence_summary}.",
                f"Review reason: {review_reason}",
                candidate_line,
                f"If approved after ministry validation, the matter should proceed under {rule}.",
            ]
        )
