"""
SansadDarpan weekly briefs API routes.

GET  /api/sansaddarpan/weekly-briefs         — list published weekly briefs
GET  /api/sansaddarpan/weekly-briefs/{id}    — single brief with full content
POST /api/sansaddarpan/weekly-briefs/generate — trigger brief generation (authenticated)
"""
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import get_db
from app.models.constituency import Constituency
from app.models.mp_identity import MpIdentity
from app.models.weekly_brief import WeeklyBrief
from app.services.weekly_brief_generator import generate_weekly_brief

router = APIRouter(prefix="/api/sansaddarpan/weekly-briefs", tags=["sansaddarpan-weekly-briefs"])
settings = get_settings()


# --- Schemas ---

class WeeklyBriefCardResponse(BaseModel):
    id: str
    week_number: int
    year: int
    constituency_name: str
    constituency_state: str
    mp_name: Optional[str]
    headline: str
    status: str
    youtube_title: Optional[str]
    published_at: Optional[str]
    created_at: str


class WeeklyBriefDetailResponse(WeeklyBriefCardResponse):
    brief_markdown: str
    video_script_json: Dict[str, Any]
    mp_whatsapp_brief: str
    hindi_translation: Optional[Dict[str, Any]]
    youtube_description: Optional[str]
    reel_scripts: Optional[List[Dict[str, Any]]]


class WeeklyBriefListResponse(BaseModel):
    briefs: List[WeeklyBriefCardResponse]


class GenerateBriefRequest(BaseModel):
    constituency_id: int
    week_number: int
    year: int


class GenerateBriefResponse(BaseModel):
    id: str
    status: str
    constituency_name: str
    week_number: int
    year: int


# --- Helpers ---

def _brief_to_card(brief: WeeklyBrief, constituency: Constituency, mp: Optional[MpIdentity]) -> WeeklyBriefCardResponse:
    # Extract headline from markdown
    headline = ""
    if brief.brief_markdown:
        for line in brief.brief_markdown.split("\n"):
            if line.startswith("# "):
                headline = line[2:].strip()
                break
    if not headline:
        headline = "Weekly Brief — %s, Week %d" % (constituency.name, brief.week_number)

    return WeeklyBriefCardResponse(
        id=str(brief.id),
        week_number=brief.week_number,
        year=brief.year,
        constituency_name=constituency.name,
        constituency_state=constituency.state,
        mp_name=mp.full_name_en if mp else constituency.mp_name,
        headline=headline,
        status=brief.status,
        youtube_title=brief.youtube_title,
        published_at=brief.published_at.isoformat() if brief.published_at else None,
        created_at=brief.created_at.isoformat(),
    )


def _brief_to_detail(brief: WeeklyBrief, constituency: Constituency, mp: Optional[MpIdentity]) -> WeeklyBriefDetailResponse:
    card = _brief_to_card(brief, constituency, mp)
    return WeeklyBriefDetailResponse(
        **card.dict(),
        brief_markdown=brief.brief_markdown,
        video_script_json=brief.video_script_json,
        mp_whatsapp_brief=brief.mp_whatsapp_brief,
        hindi_translation=brief.hindi_translation,
        youtube_description=brief.youtube_description,
        reel_scripts=brief.reel_scripts,
    )


def _require_internal_auth(authorization: Optional[str]) -> None:
    """Simple auth check — requires matching sync secret or bearer token."""
    configured_secret = settings.sync_shared_secret.strip()
    if not configured_secret:
        return  # No auth configured, allow in dev
    if authorization and configured_secret in authorization:
        return
    raise HTTPException(status_code=401, detail="Unauthorized")


# --- Routes ---

@router.get("", response_model=WeeklyBriefListResponse)
async def list_weekly_briefs(db: AsyncSession = Depends(get_db)) -> WeeklyBriefListResponse:
    try:
        result = await db.execute(
            select(WeeklyBrief, Constituency, MpIdentity)
            .join(Constituency, Constituency.id == WeeklyBrief.constituency_id)
            .outerjoin(MpIdentity, MpIdentity.mp_id == WeeklyBrief.mp_id)
            .order_by(desc(WeeklyBrief.year), desc(WeeklyBrief.week_number), desc(WeeklyBrief.created_at))
        )
        rows = result.all()
    except SQLAlchemyError:
        return WeeklyBriefListResponse(briefs=[])

    return WeeklyBriefListResponse(
        briefs=[_brief_to_card(brief, constituency, mp) for brief, constituency, mp in rows]
    )


@router.get("/{brief_id}", response_model=WeeklyBriefDetailResponse)
async def get_weekly_brief(brief_id: str, db: AsyncSession = Depends(get_db)) -> WeeklyBriefDetailResponse:
    # Validate UUID format
    try:
        UUID(brief_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Weekly brief not found")

    try:
        result = await db.execute(
            select(WeeklyBrief, Constituency, MpIdentity)
            .join(Constituency, Constituency.id == WeeklyBrief.constituency_id)
            .outerjoin(MpIdentity, MpIdentity.mp_id == WeeklyBrief.mp_id)
            .where(WeeklyBrief.id == brief_id)
        )
        row = result.one_or_none()
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable")

    if row is None:
        raise HTTPException(status_code=404, detail="Weekly brief not found")

    brief, constituency, mp = row
    return _brief_to_detail(brief, constituency, mp)


@router.post("/generate", response_model=GenerateBriefResponse)
async def trigger_brief_generation(
    body: GenerateBriefRequest,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> GenerateBriefResponse:
    _require_internal_auth(authorization)

    try:
        brief = await generate_weekly_brief(
            db=db,
            constituency_id=body.constituency_id,
            week_number=body.week_number,
            year=body.year,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Brief generation failed: %s" % exc)

    # Get constituency name for response
    constituency_result = await db.execute(
        select(Constituency).where(Constituency.id == body.constituency_id)
    )
    constituency = constituency_result.scalar_one_or_none()

    return GenerateBriefResponse(
        id=str(brief.id),
        status=brief.status,
        constituency_name=constituency.name if constituency else "Unknown",
        week_number=brief.week_number,
        year=brief.year,
    )
