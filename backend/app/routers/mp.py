from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Header, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.mp_brief import MPBrief
from app.models.parliamentary_action import ParliamentaryAction
from app.utils.internal_auth import require_bearer_token, require_constituency_scope, require_purpose

router = APIRouter(prefix="/api/mp", tags=["mp"])


@router.get("/brief/{constituency_id}")
async def get_mp_brief(
    constituency_id: int, authorization: Optional[str] = Header(default=None), db: AsyncSession = Depends(get_db)
) -> dict:
    payload = require_purpose(require_bearer_token(authorization), "mp_auth")
    require_constituency_scope(payload, constituency_id)
    briefs = (
        await db.execute(
            select(MPBrief)
            .where(MPBrief.constituency_id == constituency_id)
            .order_by(desc(MPBrief.week_date))
            .limit(5)
        )
    ).scalars().all()
    return {
        "constituency_id": constituency_id,
        "current_week": briefs[0].brief_content if briefs else None,
        "history": [
            {
                "week_date": brief.week_date.isoformat(),
                "brief_pdf_url": brief.brief_pdf_url,
                "delivery_status": brief.delivery_status,
            }
            for brief in briefs[1:]
        ],
    }


@router.get("/actions/{constituency_id}")
async def get_mp_actions(
    constituency_id: int, authorization: Optional[str] = Header(default=None), db: AsyncSession = Depends(get_db)
) -> dict:
    payload = require_purpose(require_bearer_token(authorization), "mp_auth")
    require_constituency_scope(payload, constituency_id)
    actions = (
        await db.execute(
            select(ParliamentaryAction)
            .where(ParliamentaryAction.constituency_id == constituency_id)
            .order_by(desc(ParliamentaryAction.created_at))
        )
    ).scalars().all()
    return {
        "constituency_id": constituency_id,
        "actions": [
            {
                "id": str(action.id),
                "action_type": action.action_type,
                "status": action.status,
                "ministry": action.ministry,
                "content": action.content,
                "rule": action.lok_sabha_rule,
            }
            for action in actions
        ],
    }


@router.post("/action/{action_id}/approve")
async def approve_action(
    action_id: str,
    request_body: Optional[dict] = Body(default=None),
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    auth_payload = require_purpose(require_bearer_token(authorization), "mp_auth")
    action = await db.scalar(select(ParliamentaryAction).where(ParliamentaryAction.id == UUID(action_id)))
    if action is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
    require_constituency_scope(auth_payload, int(action.constituency_id or 0))
    body = request_body if isinstance(request_body, dict) else {}
    edited_content = (body.get("edited_content") or "").strip()
    approved_ministry = (body.get("approved_ministry") or "").strip()
    if edited_content:
        action.content = edited_content
    if approved_ministry:
        action.ministry = approved_ministry
    action.mp_approved = True
    if action.status in {"draft", "needs_review"}:
        action.status = "submitted_to_mp"
    await db.commit()
    return {
        "action_id": action_id,
        "status": action.status,
        "mp_approved": True,
        "content_updated": bool(edited_content),
        "ministry_updated": bool(approved_ministry),
    }
