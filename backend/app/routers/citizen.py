from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.intake import IntakeAgent
from app.database import get_db
from app.models.agent_log import AgentLog
from app.models.citizen import Citizen
from app.models.constituency import Constituency
from app.models.issue import Issue
from app.schemas.citizen import (
    CitizenSubmitRequest,
    CitizenSubmitResponse,
    CitizenVerifyConfirmRequest,
    CitizenVerifyConfirmResponse,
    CitizenVerifyRequest,
    CitizenVerifyResponse,
)
from app.services.embedding import EmbeddingService
from app.utils.auth_tokens import sign_payload, verify_token
from app.utils.hashing import sha256_hex

router = APIRouter(prefix="/api/citizen", tags=["citizen"])


def _require_auth(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    return token


async def _get_constituency_or_404(db: AsyncSession, constituency_id: int) -> Constituency:
    result = await db.execute(select(Constituency).where(Constituency.id == constituency_id))
    constituency = result.scalar_one_or_none()
    if constituency is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Constituency not found")
    return constituency


async def create_verification_session(db: AsyncSession, payload: CitizenVerifyRequest) -> CitizenVerifyResponse:
    await _get_constituency_or_404(db, payload.constituency_id)
    session_token = sign_payload(
        {"mobile_e164": payload.mobile_e164, "constituency_id": payload.constituency_id, "purpose": "citizen_verify"},
        ttl_minutes=15,
    )
    return CitizenVerifyResponse(session_token=session_token)


async def confirm_verification_session(db: AsyncSession, payload: CitizenVerifyConfirmRequest) -> CitizenVerifyConfirmResponse:
    token_payload = verify_token(payload.session_token)
    if token_payload.get("purpose") != "citizen_verify":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")
    if not payload.otp.isdigit():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP must be numeric")

    mobile_hash = sha256_hex(token_payload["mobile_e164"])
    constituency_id = int(token_payload["constituency_id"])
    await _get_constituency_or_404(db, constituency_id)

    result = await db.execute(select(Citizen).where(Citizen.mobile_hash == mobile_hash))
    citizen = result.scalar_one_or_none()
    if citizen is None:
        citizen = Citizen(
            mobile_hash=mobile_hash,
            constituency_id=constituency_id,
            verified=True,
            consent_flags={"issue_storage": False, "mapping": False, "aggregation": False, "mp_brief": False},
            age_verified=False,
            blocked=False,
            last_active=datetime.now(timezone.utc),
        )
        db.add(citizen)
        await db.flush()
    else:
        citizen.constituency_id = constituency_id
        citizen.verified = True
        citizen.last_active = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(citizen)

    jwt = sign_payload({"citizen_id": str(citizen.id), "constituency_id": constituency_id, "purpose": "citizen_auth"}, ttl_minutes=60 * 24 * 7)
    return CitizenVerifyConfirmResponse(citizen_id=str(citizen.id), jwt=jwt)


async def submit_issue_for_citizen(
    db: AsyncSession, payload: CitizenSubmitRequest, bearer_token: str
) -> CitizenSubmitResponse:
    token_payload = verify_token(bearer_token)
    if token_payload.get("purpose") != "citizen_auth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid citizen token")

    citizen_id = UUID(token_payload["citizen_id"])
    result = await db.execute(select(Citizen).where(Citizen.id == citizen_id))
    citizen = result.scalar_one_or_none()
    if citizen is None or not citizen.verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Citizen not verified")
    if citizen.constituency_id != payload.constituency_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Constituency mismatch")

    await _get_constituency_or_404(db, payload.constituency_id)

    intake = await IntakeAgent().run(payload.text, {"language": payload.language, "location": payload.location, "channel": "web"})
    embedding = await EmbeddingService().embed_text(payload.text)

    issue = Issue(
        citizen_id=citizen.id,
        constituency_id=payload.constituency_id,
        raw_text=payload.text,
        translated_text=payload.text,
        source_language=payload.language,
        source_channel="web",
        issue_type=intake.get("issue_type"),
        severity_score=intake.get("severity_score"),
        urgency_flag=bool(intake.get("urgency_flag")),
        location_district=intake.get("location_district"),
        location_ward=intake.get("location_ward"),
        affected_estimate=intake.get("affected_estimate"),
        embedding=embedding,
        ministry_mapped=intake.get("ministry_mapped"),
    )
    db.add(issue)
    await db.flush()

    db.add(
        AgentLog(
            agent_type="intake",
            constituency_id=payload.constituency_id,
            action="web_submit_processed",
            input_hash=sha256_hex(payload.text),
            output_hash=sha256_hex(f"{issue.id}:{intake.get('issue_type')}:{intake.get('severity_score')}"),
            model_version=IntakeAgent.model,
            tokens_used=0,
            latency_ms=0,
            error_code=None,
        )
    )
    citizen.last_active = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(issue)

    return CitizenSubmitResponse(issue_id=str(issue.id), status="accepted", cluster_id=str(issue.cluster_id) if issue.cluster_id else None)


@router.post("/submit", response_model=CitizenSubmitResponse)
async def submit_issue(
    payload: CitizenSubmitRequest,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> CitizenSubmitResponse:
    bearer_token = _require_auth(authorization)
    return await submit_issue_for_citizen(db, payload, bearer_token)


@router.post("/verify", response_model=CitizenVerifyResponse)
async def verify_citizen(payload: CitizenVerifyRequest, db: AsyncSession = Depends(get_db)) -> CitizenVerifyResponse:
    return await create_verification_session(db, payload)


@router.post("/verify/confirm", response_model=CitizenVerifyConfirmResponse)
async def confirm_citizen_verification(
    payload: CitizenVerifyConfirmRequest, db: AsyncSession = Depends(get_db)
) -> CitizenVerifyConfirmResponse:
    return await confirm_verification_session(db, payload)


@router.get("/issue/{issue_id}")
async def get_citizen_issue(issue_id: str, authorization: Optional[str] = Header(default=None)) -> dict:
    _require_auth(authorization)
    return {"issue_id": issue_id, "cluster_membership": None, "rank": None, "parliamentary_action": None}


@router.post("/dissent")
async def file_dissent(authorization: Optional[str] = Header(default=None)) -> dict:
    _require_auth(authorization)
    return {"dissent_id": None}


@router.delete("/data")
async def erase_citizen_data(authorization: Optional[str] = Header(default=None)) -> dict:
    _require_auth(authorization)
    return {"status": "queued"}
