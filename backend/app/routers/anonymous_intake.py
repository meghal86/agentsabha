from __future__ import annotations

import hashlib
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.issue import Issue
from app.schemas.anonymous_intake import AnonIntakeRequest, AnonIntakeResponse
from app.services.intake_pipeline import process_issue_intake

router = APIRouter(prefix="/api/intake", tags=["intake"])


def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode("utf-8")).hexdigest()


def _client_ip(x_forwarded_for: Optional[str], request: Request) -> Optional[str]:
    if x_forwarded_for:
        # X-Forwarded-For may be a comma-separated list; leftmost is the original client.
        return x_forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


@router.post("/anonymous", response_model=AnonIntakeResponse, status_code=201)
async def submit_anonymous_issue(
    payload: AnonIntakeRequest,
    request: Request,
    x_forwarded_for: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> AnonIntakeResponse:
    raw_ip = _client_ip(x_forwarded_for, request)
    ip_hash = _hash_ip(raw_ip) if raw_ip else None

    # INSERT ... ON CONFLICT DO NOTHING exploits the DB-level unique index
    # uix_issues_anon_dedup (ip_hash, constituency_id, COALESCE(issue_type,''),
    # submitted_at_bucket) WHERE ip_hash IS NOT NULL, which enforces the 6-hour
    # deduplication window without any race condition.
    stmt = (
        pg_insert(Issue.__table__)
        .values(
            ip_hash=ip_hash,
            constituency_id=payload.constituency_id,
            raw_text=payload.text,
            source_language=payload.language,
            source_channel="anonymous_web",
            issue_type=payload.category_hint,
            location_ward=payload.location,
            urgency_flag=False,
        )
        .on_conflict_do_nothing()
        .returning(Issue.__table__.c.id)
    )
    result = await db.execute(stmt)
    row = result.fetchone()

    if row is None:
        # Duplicate within the 6-hour window — silently accept without revealing
        # the rejection to the caller (anti-enumeration / anti-spam).
        return AnonIntakeResponse(issue_id="", status="accepted")

    issue_id: UUID = row[0]
    await db.commit()

    await process_issue_intake(db, issue_id)

    return AnonIntakeResponse(issue_id=str(issue_id), status="accepted")
