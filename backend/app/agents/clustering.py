from __future__ import annotations

import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from time import perf_counter

from sqlalchemy import and_, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.agent_log import AgentLog
from app.models.cluster import IssueCluster
from app.models.issue import Issue
from app.utils.audit_logger import AuditEntry, build_audit_payload
from app.utils.hashing import sha256_hex

STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "have",
    "has",
    "our",
    "this",
    "that",
    "after",
    "near",
    "into",
    "your",
    "their",
    "ward",
    "area",
    "issue",
    "issues",
    "reported",
    "citizens",
    "being",
    "been",
    "over",
    "when",
    "where",
    "because",
    "daily",
}


def _tokenize(text: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-zA-Z]{4,}", text.lower())
        if token not in STOPWORDS
    ]


def _cluster_label(category: str, texts: list[str]) -> str:
    category_title = (category or "other").replace("_", " ").title()
    tokens = Counter(token for text in texts for token in _tokenize(text))
    keywords = [token for token, _ in tokens.most_common(2)]
    if keywords:
        return f"{category_title} — {' / '.join(keywords)}"
    return f"{category_title} constituency issue pattern"


@dataclass
class ClusteringAgent:
    model: str = "deterministic-clustering-v1"

    async def run(self, db: AsyncSession, constituency_id: int) -> dict:
        settings = get_settings()
        started = perf_counter()
        now = datetime.now(timezone.utc)
        current_window = now - timedelta(days=7)
        previous_window = now - timedelta(days=14)

        current_issues = (
            await db.execute(
                select(Issue)
                .where(Issue.constituency_id == constituency_id, Issue.created_at >= current_window)
                .order_by(Issue.created_at.desc())
            )
        ).scalars().all()

        buckets: dict[str, list[Issue]] = defaultdict(list)
        for issue in current_issues:
            buckets[(issue.issue_type or "other")].append(issue)

        clusters_updated = 0
        published_clusters = 0

        for category, issues in buckets.items():
            if len(issues) < 5:
                continue

            representative_texts = [issue.translated_text or issue.raw_text for issue in issues[:10]]
            label = _cluster_label(category, representative_texts)
            current_count = len(issues)
            previous_count = (
                await db.execute(
                    select(func.count(Issue.id)).where(
                        Issue.constituency_id == constituency_id,
                        Issue.issue_type == category,
                        Issue.created_at >= previous_window,
                        Issue.created_at < current_window,
                    )
                )
            ).scalar_one()
            velocity = Decimal("0.0")
            if previous_count:
                velocity = Decimal(((current_count - previous_count) / previous_count) * 100).quantize(Decimal("0.1"))

            first_seen = min(issue.created_at for issue in issues)
            severity_values = [Decimal(str(issue.severity_score)) for issue in issues if issue.severity_score is not None]
            severity_avg = (
                (sum(severity_values, Decimal("0.0")) / Decimal(len(severity_values))).quantize(Decimal("0.1"))
                if severity_values
                else Decimal("5.0")
            )
            cluster_age_hours = max((now - first_seen).total_seconds() / 3600, 0)
            badge = "stable"
            if (
                float(severity_avg) >= settings.tatkal_severity_threshold
                and cluster_age_hours <= settings.tatkal_max_age_hours
                and current_count >= settings.tatkal_new_reports_threshold
            ):
                badge = "tatkal"
            elif float(velocity) >= 25:
                badge = "rising"
            elif cluster_age_hours >= 24 * 30:
                badge = "chronic"

            national_count = (
                await db.execute(
                    select(func.count(func.distinct(Issue.constituency_id))).where(
                        Issue.issue_type == category,
                        Issue.created_at >= current_window,
                    )
                )
            ).scalar_one()

            existing_cluster = await db.scalar(
                select(IssueCluster)
                .where(
                    IssueCluster.constituency_id == constituency_id,
                    IssueCluster.category == category,
                )
                .order_by(desc(IssueCluster.issue_count), desc(IssueCluster.last_updated))
                .limit(1)
            )

            if existing_cluster is None:
                existing_cluster = IssueCluster(
                    constituency_id=constituency_id,
                    label=label,
                    category=category,
                    first_seen=first_seen,
                )
                db.add(existing_cluster)
                await db.flush()

            existing_cluster.label = label
            existing_cluster.issue_count = current_count
            existing_cluster.severity_avg = severity_avg
            existing_cluster.velocity = velocity
            existing_cluster.badge = badge
            existing_cluster.last_updated = now
            existing_cluster.national_flag = bool(national_count >= 10)

            for issue in issues:
                issue.cluster_id = existing_cluster.id

            clusters_updated += 1
            if current_count >= settings.correct_constituency_minimum_cluster_size:
                published_clusters += 1

        audit_payload = build_audit_payload(
            AuditEntry(
                agent_type="clustering",
                constituency_id=constituency_id,
                action="clusters_refreshed",
                input_hash=sha256_hex(f"{constituency_id}:{len(current_issues)}"),
                output_hash=sha256_hex(f"{constituency_id}:{clusters_updated}:{published_clusters}"),
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
            "clusters_updated": clusters_updated,
            "published_clusters": published_clusters,
        }
