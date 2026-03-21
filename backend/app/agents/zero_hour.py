from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from math import log10
import re
from time import perf_counter

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.agent_log import AgentLog
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.utils.audit_logger import AuditEntry, build_audit_payload
from app.utils.hashing import sha256_hex

ZERO_HOUR_DEADLINE = "08:45 IST"
COORDINATION_MIN_CONSTITUENCIES = 5


@dataclass
class ZeroHourAgent:
    model: str = "claude-sonnet-4-6"

    async def run(self, db: AsyncSession, constituency_id: int | None = None) -> dict:
        settings = get_settings()
        started = perf_counter()
        now = datetime.now(timezone.utc)
        tatkal_window = now - timedelta(hours=settings.tatkal_max_age_hours)
        recent_window = now - timedelta(hours=12)

        filters = [IssueCluster.issue_count >= settings.tatkal_new_reports_threshold]
        if constituency_id is not None:
            filters.append(IssueCluster.constituency_id == constituency_id)

        candidate_clusters = (
            await db.execute(
                select(IssueCluster)
                .where(*filters)
                .order_by(desc(IssueCluster.last_updated), desc(IssueCluster.severity_avg))
            )
        ).scalars().all()

        prepared: list[dict] = []
        for cluster in candidate_clusters:
            if float(cluster.severity_avg or 0) < settings.tatkal_severity_threshold:
                continue
            if cluster.first_seen is None or cluster.first_seen < tatkal_window:
                continue

            issues = (
                await db.execute(
                    select(Issue)
                    .where(Issue.cluster_id == cluster.id)
                    .order_by(desc(Issue.created_at))
                    .limit(20)
                )
            ).scalars().all()
            if not issues:
                continue

            new_reports = (
                await db.execute(
                    select(func.count(Issue.id)).where(Issue.cluster_id == cluster.id, Issue.created_at >= recent_window)
                )
            ).scalar_one()
            if new_reports < settings.tatkal_new_reports_threshold:
                continue

            ministry = self._resolve_ministry(issues)
            if ministry is None:
                continue

            signature = self._cluster_signature(cluster)
            rank_score = self._priority_score(cluster, new_reports)
            prepared.append(
                {
                    "cluster": cluster,
                    "issues": issues,
                    "new_reports": int(new_reports),
                    "ministry": ministry,
                    "signature": signature,
                    "rank_score": rank_score,
                }
            )

        grouped: dict[str, list[dict]] = defaultdict(list)
        for item in prepared:
            grouped[item["signature"]].append(item)

        notices_created = 0
        coordinated_notices = 0
        processed_cluster_ids: set[str] = set()

        for signature, items in grouped.items():
            items.sort(key=lambda item: item["rank_score"], reverse=True)
            coordinated = len({item["cluster"].constituency_id for item in items}) >= COORDINATION_MIN_CONSTITUENCIES
            primary = items[0]
            cluster = primary["cluster"]
            if str(cluster.id) in processed_cluster_ids:
                continue

            covered_items = items if coordinated else [primary]
            for item in covered_items:
                processed_cluster_ids.add(str(item["cluster"].id))

            notice_payload = await self._build_notice_payload(db, covered_items, coordinated=coordinated)
            existing = await db.scalar(
                select(ParliamentaryAction)
                .where(
                    ParliamentaryAction.action_type == "zero_hour",
                    ParliamentaryAction.cluster_id == cluster.id,
                    ParliamentaryAction.status.in_(("draft", "submitted_to_mp", "needs_review")),
                )
                .order_by(desc(ParliamentaryAction.created_at))
                .limit(1)
            )

            content = self._render_notice_text(notice_payload)
            if existing is None:
                existing = ParliamentaryAction(
                    constituency_id=cluster.constituency_id,
                    cluster_id=cluster.id,
                    action_type="zero_hour",
                    content=content,
                    source_citations=notice_payload["citations"],
                    ministry=notice_payload["ministry"],
                    lok_sabha_rule="Zero Hour",
                    status="draft",
                )
                db.add(existing)
                notices_created += 1
            else:
                existing.content = content
                existing.source_citations = notice_payload["citations"]
                existing.ministry = notice_payload["ministry"]
                existing.lok_sabha_rule = "Zero Hour"
                existing.status = "draft"

            if coordinated:
                coordinated_notices += 1

        audit_payload = build_audit_payload(
            AuditEntry(
                agent_type="zero_hour",
                constituency_id=constituency_id,
                action="zero_hour_notices_generated",
                input_hash=sha256_hex(f"{constituency_id}:{len(candidate_clusters)}"),
                output_hash=sha256_hex(f"{notices_created}:{coordinated_notices}"),
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
            "notices_created": notices_created,
            "coordinated_notices": coordinated_notices,
        }

    async def _build_notice_payload(self, db: AsyncSession, items: list[dict], *, coordinated: bool) -> dict:
        primary = items[0]
        cluster: IssueCluster = primary["cluster"]
        issues: list[Issue] = primary["issues"]
        constituencies = []
        for item in items:
            constituency = await db.scalar(select(Constituency).where(Constituency.id == item["cluster"].constituency_id))
            if constituency is not None:
                constituencies.append(constituency.name)
        constituencies = list(dict.fromkeys(constituencies))

        citizen_count = sum(int(item["new_reports"]) for item in items)
        quotes = self._citizen_quotes([issue for item in items for issue in item["issues"]])
        label = cluster.label or cluster.category or "urgent public issue"
        locations = self._evidence_locations([issue for item in items for issue in item["issues"]])
        subject = self._notice_subject(label, coordinated=coordinated, constituency_names=constituencies)
        urgency = self._urgency_justification(
            label=label,
            citizen_count=citizen_count,
            locations=locations,
            coordinated=coordinated,
            constituency_names=constituencies,
        )
        speech = self._speech_draft(
            label=label,
            ministry=primary["ministry"],
            citizen_count=citizen_count,
            quotes=quotes,
            coordinated=coordinated,
            constituency_names=constituencies,
            locations=locations,
        )
        citations = [
            {
                "title": f"Tatkal cluster '{label}'",
                "url": f"https://agentsabha.in/citations/clusters/{cluster.id}",
                "type": "cluster_snapshot",
                "date": cluster.last_updated.date().isoformat(),
            },
            *[
                {
                    "title": f"Verified issue evidence from {issue.location_ward or issue.location_district or 'reported location'}",
                    "url": f"https://agentsabha.in/citations/issues/{issue.id}",
                    "type": "verified_citizen_report",
                    "date": issue.created_at.date().isoformat(),
                }
                for issue in [issue for item in items for issue in item["issues"][:2]][:4]
            ],
            {
                "title": "Zero Hour metadata",
                "url": "https://agentsabha.in/citations/agent-metadata/zero-hour",
                "type": "agent_metadata",
                "date": now_ist_date(),
                "coordinated": coordinated,
                "constituencies_affected": constituencies,
                "citizen_count": citizen_count,
                "filing_deadline": ZERO_HOUR_DEADLINE,
            },
        ]
        return {
            "notice_subject": subject,
            "urgency_justification": urgency,
            "speech_draft": speech,
            "ministry": primary["ministry"],
            "constituencies_affected": constituencies,
            "citizen_count": citizen_count,
            "filing_deadline": ZERO_HOUR_DEADLINE,
            "citations": citations,
        }

    def _priority_score(self, cluster: IssueCluster, new_reports: int) -> float:
        severity = float(cluster.severity_avg or 0)
        velocity = float(cluster.velocity or 0)
        return severity * 5 + log10(max(new_reports, 1)) * 6 + max(velocity, 0) / 10

    def _resolve_ministry(self, issues: list[Issue]) -> str | None:
        counter = Counter(issue.ministry_mapped for issue in issues if issue.ministry_mapped)
        if not counter:
            return None
        ministry, _count = counter.most_common(1)[0]
        return ministry

    def _cluster_signature(self, cluster: IssueCluster) -> str:
        label = re.sub(r"[^a-z0-9 ]+", " ", (cluster.label or cluster.category or "").lower())
        tokens = [token for token in label.split() if token not in {"the", "and", "for", "issue", "urgent", "public"}]
        return " ".join(sorted(dict.fromkeys(tokens))[:5]) or str(cluster.id)

    def _notice_subject(self, label: str, *, coordinated: bool, constituency_names: list[str]) -> str:
        if coordinated:
            subject = f"Urgent {label} across {len(constituency_names)} constituencies"
        else:
            subject = f"Urgent {label}"
        words = subject.split()
        return " ".join(words[:15])

    def _urgency_justification(
        self,
        *,
        label: str,
        citizen_count: int,
        locations: str,
        coordinated: bool,
        constituency_names: list[str],
    ) -> str:
        if coordinated:
            return (
                f"This matter concerns urgent public importance because {citizen_count} fresh citizen reports have emerged within twelve hours "
                f"across {', '.join(constituency_names[:5])}. The pattern is simultaneous and cannot wait for ordinary Question Hour scheduling."
            )
        return (
            f"This matter cannot await the normal Question Hour cycle because {citizen_count} fresh reports have emerged within twelve hours "
            f"from {locations}, indicating immediate public harm linked to {label}."
        )

    def _speech_draft(
        self,
        *,
        label: str,
        ministry: str,
        citizen_count: int,
        quotes: list[str],
        coordinated: bool,
        constituency_names: list[str],
        locations: str,
    ) -> str:
        opening_fact = (
            f"{citizen_count} fresh citizen reports have been verified in the last twelve hours."
            if not coordinated
            else f"{citizen_count} fresh citizen reports have been verified across {len(constituency_names)} constituencies in the last twelve hours."
        )
        quote_lines = " ".join(f'"{quote}"' for quote in quotes[:2])
        coordination_line = (
            f"This is not an isolated constituency grievance; the same distress signal has emerged from {', '.join(constituency_names[:5])}."
            if coordinated
            else f"The reports are concentrated across {locations}, showing an immediate constituency-wide emergency."
        )
        return (
            f"Hon'ble Speaker Sir/Madam, I rise to raise a matter of urgent public importance concerning {label}. "
            f"{opening_fact} {coordination_line} "
            f"Anonymised citizen evidence states: {quote_lines} "
            f"The human cost is immediate and continuing, and the matter squarely concerns {ministry}. "
            f"I therefore urge the Government to issue immediate field instructions, deploy emergency response where necessary, "
            f"and place a time-bound action report before the House without delay."
        )

    def _citizen_quotes(self, issues: list[Issue]) -> list[str]:
        quotes: list[str] = []
        for issue in issues:
            text = re.sub(r"\s+", " ", (issue.translated_text or issue.raw_text or "").strip())
            if not text:
                continue
            quote = text[:120].strip()
            if quote not in quotes:
                quotes.append(quote)
            if len(quotes) == 3:
                break
        return quotes or ["Citizens report urgent public harm and demand immediate intervention."]

    def _evidence_locations(self, issues: list[Issue]) -> str:
        locations = [issue.location_ward or issue.location_district for issue in issues if issue.location_ward or issue.location_district]
        unique = list(dict.fromkeys(locations))
        if not unique:
            return "multiple reported locations"
        return ", ".join(unique[:3])

    def _render_notice_text(self, payload: dict) -> str:
        return "\n".join(
            [
                f"Subject: {payload['notice_subject']}",
                f"Ministry: {payload['ministry']}",
                f"Constituencies affected: {', '.join(payload['constituencies_affected'])}",
                f"Citizen evidence: {payload['citizen_count']} fresh reports",
                f"Filing deadline: {payload['filing_deadline']}",
                "",
                "Urgency justification:",
                payload["urgency_justification"],
                "",
                "Three-minute speech draft:",
                payload["speech_draft"],
            ]
        )


def now_ist_date() -> str:
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).date().isoformat()
