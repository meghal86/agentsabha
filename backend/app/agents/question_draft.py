from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from math import log10
import re
from time import perf_counter

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
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
        settings = get_settings()
        constituency = await db.scalar(select(Constituency).where(Constituency.id == constituency_id))
        if constituency is None:
            return {"constituency_id": constituency_id, "drafts_created": 0}

        candidate_clusters = (
            await db.execute(
                select(IssueCluster)
                .where(IssueCluster.constituency_id == constituency_id, IssueCluster.issue_count >= MIN_VERIFIED_REPORTS)
                .order_by(desc(IssueCluster.last_updated))
                .limit(8)
            )
        ).scalars().all()

        drafts_created = 0
        reviews_needed = 0
        shadow_drafts = 0
        clusters: list[tuple[IssueCluster, list[Issue], float]] = []
        seen_signatures: list[set[str]] = []
        for cluster in candidate_clusters:
            evidence_issues = (
                await db.execute(
                    select(Issue)
                    .where(Issue.cluster_id == cluster.id)
                    .order_by(desc(Issue.created_at))
                    .limit(20)
                )
            ).scalars().all()
            if len(evidence_issues) < min(3, MIN_VERIFIED_REPORTS) or cluster.issue_count < MIN_VERIFIED_REPORTS:
                continue
            signature = self._cluster_signature(cluster, evidence_issues)
            if any(self._signature_overlap(signature, existing) >= 0.75 for existing in seen_signatures):
                continue
            seen_signatures.append(signature)
            score = self._cluster_rank_score(cluster, evidence_issues)
            clusters.append((cluster, evidence_issues, score))

        for cluster, evidence_issues, _score in sorted(clusters, key=lambda item: item[2], reverse=True)[:3]:
            recent_issues = evidence_issues[:10]

            action_type = self._question_type(cluster)
            rule = "Rule 32" if action_type == "question_starred" else "Rule 33"
            citizen_count = int(cluster.issue_count or 0)
            label = (cluster.label or cluster.category or "constituency grievance").strip()
            evidence_summary = self._build_evidence_summary(evidence_issues)
            rank_score = self._cluster_rank_score(cluster, evidence_issues)
            cluster_citation = self._cluster_citation(cluster, constituency.name, rank_score=rank_score)
            ministry_resolution = self._resolve_ministry(evidence_issues)
            status = "draft"
            ministry = ministry_resolution["ministry"]
            review_reasons: list[str] = []
            statutory_hook = await SourceRetrievalService().retrieve_primary_source(
                category=cluster.category,
                ministry=ministry,
                label=label,
                issue_text=label,
                issue_texts=[issue.translated_text or issue.raw_text for issue in evidence_issues[:5]],
            )
            live_source = statutory_hook.get("retrieval_status") == "live"
            citations = [statutory_hook, cluster_citation, *self._issue_citations(evidence_issues)]
            if ministry is None:
                status = "needs_review"
                review_reasons.append(str(ministry_resolution["reason"] or "Ministry mapping is uncertain."))
            if not live_source:
                status = "needs_review"
                review_reasons.append("Primary source retrieval did not resolve to a live official source.")
            if self._needs_escalated_review(evidence_issues):
                status = "needs_review"
                review_reasons.append("Citizen evidence is highly repetitive and requires stronger review before filing.")
            confidence_score = self._draft_confidence_score(
                cluster=cluster,
                issues=evidence_issues,
                rank_score=rank_score,
                ministry_confidence=float(ministry_resolution.get("confidence") or 0.0),
                live_source=live_source,
                review_reasons=review_reasons,
            )

            if status == "needs_review":
                question_text = self._build_review_text(
                    rule=rule,
                    constituency_name=constituency.name,
                    label=label,
                    citizen_count=citizen_count,
                    evidence_summary=evidence_summary,
                    suggested_ministries=ministry_resolution["candidates"],
                    review_reason=" ".join(dict.fromkeys(review_reasons)),
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
                    cluster=cluster,
                )
            citations.append(
                self._agent_metadata_citation(
                    confidence_score=confidence_score,
                    rank_score=rank_score,
                    ministry_confidence=float(ministry_resolution.get("confidence") or 0.0),
                    status=status,
                    shadow_mode=settings.question_draft_shadow_mode,
                    review_reasons=review_reasons,
                )
            )

            if settings.question_draft_shadow_mode:
                shadow_drafts += 1
                continue

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
                action="draft_questions_generated_shadow" if settings.question_draft_shadow_mode else "draft_questions_generated",
                input_hash=sha256_hex(f"{constituency_id}:{len(clusters)}"),
                output_hash=sha256_hex(f"{constituency_id}:{drafts_created}:{reviews_needed}:{shadow_drafts}"),
                model_version=self.model,
                tokens_used=0,
                latency_ms=int((perf_counter() - started) * 1000),
                error_code=None,
            )
        )
        db.add(AgentLog(**audit_payload))
        await db.commit()
        return {
            "constituency_id": constituency_id,
            "drafts_created": drafts_created,
            "reviews_needed": reviews_needed,
            "shadow_drafts": shadow_drafts,
            "shadow_mode": settings.question_draft_shadow_mode,
        }

    def _question_type(self, cluster: IssueCluster) -> str:
        severity = float(cluster.severity_avg or 0)
        badge = (cluster.badge or "").strip().lower()
        if severity >= 8 or (severity >= 7.5 and badge in HIGH_PRIORITY_BADGES):
            return "question_starred"
        return "question_unstarred"

    def _cluster_rank_score(self, cluster: IssueCluster, issues: list[Issue]) -> float:
        severity = float(cluster.severity_avg or 0)
        issue_count = int(cluster.issue_count or len(issues) or 0)
        velocity = float(cluster.velocity or 0)
        badge = (cluster.badge or "").strip().lower()
        urgency_bonus = 1.2 if any(issue.urgency_flag for issue in issues[:5]) else 0.0
        badge_bonus = 1.4 if badge == "tatkal" else 0.7 if badge == "rising" else 0.0
        location_diversity = len(
            {
                (issue.location_ward or issue.location_district or "").strip().lower()
                for issue in issues
                if (issue.location_ward or issue.location_district)
            }
        )
        diversity_bonus = min(location_diversity, 6) * 0.35
        return severity * 5 + log10(max(issue_count, 1)) * 4 + max(velocity, 0) / 10 + urgency_bonus + badge_bonus + diversity_bonus

    def _cluster_signature(self, cluster: IssueCluster, issues: list[Issue]) -> set[str]:
        label = re.sub(r"[^a-z0-9 ]+", " ", (cluster.label or cluster.category or "").lower())
        tokens = [
            token
            for token in label.split()
            if token not in {"the", "and", "for", "ward", "issue", "public", "near", "across"}
        ]
        if tokens:
            return set(sorted(dict.fromkeys(tokens))[:5])
        texts = " ".join((issue.translated_text or issue.raw_text or "").lower() for issue in issues[:3])
        words = [word for word in re.findall(r"[a-z0-9]{4,}", texts) if word not in {"report", "reports", "issue", "broken"}]
        return set(sorted(dict.fromkeys(words))[:5]) or {str(cluster.id)}

    def _signature_overlap(self, left: set[str], right: set[str]) -> float:
        union = left | right
        if not union:
            return 0.0
        return len(left & right) / len(union)

    def _resolve_ministry(self, issues: list[Issue]) -> dict[str, object]:
        ministry_counter = Counter(issue.ministry_mapped.strip() for issue in issues if issue.ministry_mapped)
        if not ministry_counter:
            return {
                "ministry": None,
                "candidates": [],
                "reason": "No ministry mapping is present in the current evidence.",
                "confidence": 0.0,
            }
        ministry, count = ministry_counter.most_common(1)[0]
        if ministry.lower() in {"concerned ministry", "unknown", "needs review"}:
            return {
                "ministry": None,
                "candidates": [ministry],
                "reason": "The most common ministry mapping is still unresolved.",
                "confidence": 0.0,
            }
        total = sum(ministry_counter.values())
        confidence = count / max(total, 1)
        candidates = [name for name, _ in ministry_counter.most_common(3)]
        if confidence < 0.6 and len(ministry_counter) > 1:
            return {
                "ministry": None,
                "candidates": candidates,
                "reason": "Citizen evidence points to multiple ministries and needs human review before filing.",
                "confidence": confidence,
            }
        return {"ministry": ministry, "candidates": candidates, "reason": None, "confidence": confidence}

    def _cluster_citation(self, cluster: IssueCluster, constituency_name: str, *, rank_score: float) -> dict[str, str]:
        return {
            "title": f"Issue cluster '{cluster.label or cluster.category or 'constituency grievance'}' in {constituency_name}",
            "url": f"https://agentsabha.in/citations/clusters/{cluster.id}",
            "type": "cluster_snapshot",
            "date": cluster.last_updated.date().isoformat(),
            "rank_score": f"{rank_score:.2f}",
        }

    def _issue_citations(self, issues: list[Issue]) -> list[dict[str, str]]:
        citations: list[dict[str, str]] = []
        seen_texts: set[str] = set()
        for issue in issues:
            signature = re.sub(r"\s+", " ", (issue.translated_text or issue.raw_text or "").strip().lower())
            if signature in seen_texts:
                continue
            seen_texts.add(signature)
            citations.append(
                {
                    "title": f"Verified citizen report from {issue.location_ward or issue.location_district or 'reported location'}",
                    "url": f"https://agentsabha.in/citations/issues/{issue.id}",
                    "type": "verified_citizen_report",
                    "date": issue.created_at.date().isoformat(),
                }
            )
            if len(citations) == 3:
                break
        return citations

    def _needs_escalated_review(self, issues: list[Issue]) -> bool:
        texts = [re.sub(r"\s+", " ", (issue.translated_text or issue.raw_text or "").strip().lower()) for issue in issues[:8]]
        if not texts:
            return True
        unique_ratio = len(set(texts)) / len(texts)
        return unique_ratio < 0.45

    def _draft_confidence_score(
        self,
        *,
        cluster: IssueCluster,
        issues: list[Issue],
        rank_score: float,
        ministry_confidence: float,
        live_source: bool,
        review_reasons: list[str],
    ) -> float:
        severity_component = min(float(cluster.severity_avg or 0) / 10, 1.0) * 0.28
        ministry_component = min(max(ministry_confidence, 0.0), 1.0) * 0.24
        evidence_uniqueness = 1.0 - (0.35 if self._needs_escalated_review(issues) else 0.0)
        evidence_component = evidence_uniqueness * 0.18
        source_component = 0.18 if live_source else 0.05
        ranking_component = min(rank_score / 60, 1.0) * 0.12
        penalty = min(len(review_reasons) * 0.08, 0.24)
        score = severity_component + ministry_component + evidence_component + source_component + ranking_component - penalty
        return round(min(max(score, 0.0), 1.0), 2)

    def _agent_metadata_citation(
        self,
        *,
        confidence_score: float,
        rank_score: float,
        ministry_confidence: float,
        status: str,
        shadow_mode: bool,
        review_reasons: list[str],
    ) -> dict[str, str | float | bool | list[str]]:
        return {
            "title": "Agent drafting metadata",
            "url": "https://agentsabha.in/citations/agent-metadata/question-draft",
            "type": "agent_metadata",
            "date": "",
            "confidence_score": confidence_score,
            "rank_score": round(rank_score, 2),
            "ministry_confidence": round(ministry_confidence, 2),
            "status": status,
            "shadow_mode": shadow_mode,
            "review_reasons": review_reasons,
        }

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
        cluster: IssueCluster,
    ) -> str:
        opening = f"Will the Minister of {ministry} be pleased to state:"
        if action_type == "question_starred":
            body = [
                f"(a) whether the Government has taken cognisance of the recurring problem of {label} in the Lok Sabha constituency of {constituency_name};",
                f"(b) whether it is a fact that {citizen_count} verified citizens from {constituency_name} have reported the issue across {evidence_summary};",
                f"(c) the project-wise, contract-wise, scheme-wise, or implementing-agency-wise arrangement presently responsible for redressing this matter in the constituency; and",
                f"(d) the time-bound corrective action, monitoring schedule, financial provision, and accountability measures proposed by the Ministry;",
            ]
        else:
            body = [
                f"(a) whether the Government has reviewed reports of {label} in the Lok Sabha constituency of {constituency_name};",
                f"(b) whether {citizen_count} verified citizen reports have been recorded across {evidence_summary}; and",
                f"(c) the scheme-wise, project-wise, agency-wise, and timeline-bound action proposed to address the matter;",
            ]

        evidence_line = (
            f"Constituency evidence: {citizen_count} verified citizens from {constituency_name} have reported this cluster, which is presently classified as '{cluster.badge or 'stable'}' with an average severity of {float(cluster.severity_avg or 0):.1f}."
        )
        hook_line = f"Statutory and documentary basis: {statutory_hook}."
        footer = f"To be raised under {rule} of the Rules of Procedure and Conduct of Business in Lok Sabha, subject to review, editing, and approval by the Hon'ble Member."
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
