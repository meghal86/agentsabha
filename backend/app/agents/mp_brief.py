from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from time import perf_counter

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_log import AgentLog
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency
from app.models.mp_brief import MPBrief
from app.models.parliamentary_action import ParliamentaryAction
from app.services.pdf_generator import PDFGeneratorService
from app.utils.audit_logger import AuditEntry, build_audit_payload
from app.utils.hashing import sha256_hex


def _week_friday(reference: datetime | None = None) -> date:
    current = reference or datetime.now(timezone.utc)
    weekday = current.weekday()
    days_until_friday = (4 - weekday) % 7
    return (current + timedelta(days=days_until_friday)).date()


@dataclass
class MPBriefAgent:
    model: str = "claude-sonnet-4-6"

    async def run(self, db: AsyncSession, constituency_id: int) -> dict:
        started = perf_counter()
        constituency = await db.scalar(select(Constituency).where(Constituency.id == constituency_id))
        if constituency is None:
            return {"constituency_id": constituency_id, "brief_generated": False}

        clusters = (
            await db.execute(
                select(IssueCluster)
                .where(IssueCluster.constituency_id == constituency_id)
                .order_by(desc(IssueCluster.severity_avg), desc(IssueCluster.issue_count))
                .limit(5)
            )
        ).scalars().all()
        actions = (
            await db.execute(
                select(ParliamentaryAction)
                .where(ParliamentaryAction.constituency_id == constituency_id)
                .order_by(desc(ParliamentaryAction.created_at))
                .limit(5)
            )
        ).scalars().all()
        if not clusters and not actions:
            return {"constituency_id": constituency_id, "brief_generated": False}

        week_date = _week_friday()
        brief_content = {
            "header": {
                "constituency": constituency.name,
                "state": constituency.state,
                "week_date": week_date.isoformat(),
            },
            "top_issues": [
                {
                    "label": cluster.label,
                    "category": cluster.category,
                    "reports_this_week": cluster.issue_count,
                    "severity": float(cluster.severity_avg or 0),
                    "badge": cluster.badge,
                }
                for cluster in clusters
            ],
            "draft_questions": [
                {
                    "action_type": action.action_type,
                    "ministry": action.ministry,
                    "rule": action.lok_sabha_rule,
                    "content": action.content,
                    "status": action.status,
                }
                for action in actions
            ],
            "tatkal_alert": next((cluster.label for cluster in clusters if cluster.badge == "tatkal"), None),
            "constituency_vs_national_average": {
                "public_cluster_count": len(clusters),
                "top_issue_category": clusters[0].category if clusters else None,
            },
        }

        pdf_bytes = await PDFGeneratorService().render_brief(brief_content)
        brief_dir = Path(__file__).resolve().parents[2] / "generated" / "briefs"
        brief_dir.mkdir(parents=True, exist_ok=True)
        brief_path = brief_dir / f"{constituency_id}-{week_date.isoformat()}.pdf"
        brief_path.write_bytes(pdf_bytes)

        brief = await db.scalar(
            select(MPBrief).where(MPBrief.constituency_id == constituency_id, MPBrief.week_date == week_date)
        )
        if brief is None:
            brief = MPBrief(
                constituency_id=constituency_id,
                week_date=week_date,
                brief_content=brief_content,
                brief_pdf_url=str(brief_path),
                delivery_status="pending",
            )
            db.add(brief)
        else:
            brief.brief_content = brief_content
            brief.brief_pdf_url = str(brief_path)
            brief.delivery_status = brief.delivery_status or "pending"

        audit_payload = build_audit_payload(
            AuditEntry(
                agent_type="mp_brief",
                constituency_id=constituency_id,
                action="weekly_brief_generated",
                input_hash=sha256_hex(f"{constituency_id}:{len(clusters)}:{len(actions)}"),
                output_hash=sha256_hex(f"{constituency_id}:{week_date.isoformat()}"),
                model_version=self.model,
                tokens_used=0,
                latency_ms=int((perf_counter() - started) * 1000),
                error_code=None,
            )
        )
        db.add(AgentLog(**audit_payload))
        await db.commit()
        return {"constituency_id": constituency_id, "brief_generated": True, "brief_pdf_url": str(brief_path)}
