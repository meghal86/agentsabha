from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.cluster import IssueCluster
from app.models.mp_brief import MPBrief
from app.models.parliamentary_action import ParliamentaryAction
from app.models.issue import Issue
from app.utils.internal_auth import require_api_key_token

router = APIRouter(prefix="/api/journalist", tags=["journalist"])


@router.get("/package/{week_date}")
async def get_journalist_package(
    week_date: str, x_api_key: Optional[str] = Header(default=None), db: AsyncSession = Depends(get_db)
) -> dict:
    require_api_key_token(x_api_key, "journalist_api")
    briefs = (
        await db.execute(select(MPBrief).where(MPBrief.week_date == week_date).order_by(MPBrief.constituency_id))
    ).scalars().all()
    return {
        "week_date": week_date,
        "stories": [
            {
                "constituency_id": brief.constituency_id,
                "headline": (brief.brief_content or {}).get("tatkal_alert") or "Weekly constituency brief",
                "brief_pdf_url": brief.brief_pdf_url,
            }
            for brief in briefs
        ],
        "charts": [{"type": "cluster_count", "items": len(briefs)}],
    }


@router.get("/constituency/{id}/data")
async def get_journalist_constituency_data(
    id: int, x_api_key: Optional[str] = Header(default=None), db: AsyncSession = Depends(get_db)
) -> dict:
    require_api_key_token(x_api_key, "journalist_api")
    clusters = (
        await db.execute(select(IssueCluster).where(IssueCluster.constituency_id == id).order_by(desc(IssueCluster.issue_count)))
    ).scalars().all()
    actions = (
        await db.execute(select(ParliamentaryAction).where(ParliamentaryAction.constituency_id == id).order_by(desc(ParliamentaryAction.created_at)))
    ).scalars().all()
    trends = (
        await db.execute(select(Issue.issue_type, Issue.created_at).where(Issue.constituency_id == id).order_by(desc(Issue.created_at)).limit(25))
    ).all()
    return {
        "constituency_id": id,
        "clusters": [
            {"label": cluster.label, "category": cluster.category, "issue_count": cluster.issue_count, "badge": cluster.badge}
            for cluster in clusters
        ],
        "trends": [
            {"issue_type": issue_type, "created_at": created_at.isoformat() if created_at else None}
            for issue_type, created_at in trends
        ],
        "actions": [
            {"id": str(action.id), "type": action.action_type, "status": action.status, "content": action.content}
            for action in actions
        ],
    }
