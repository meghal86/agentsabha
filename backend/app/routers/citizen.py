from __future__ import annotations

from datetime import datetime, timezone
import asyncio
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from kombu.exceptions import KombuError
from redis.asyncio import from_url as redis_from_url
from sqlalchemy import delete, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.agents.clustering import ClusteringAgent
from app.models.citizen import Citizen
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency
from app.models.dissent_record import DissentRecord
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.schemas.citizen import (
    CitizenDataEraseResponse,
    CitizenDissentRequest,
    CitizenDissentResponse,
    CitizenIssueActionSummary,
    CitizenIssueClusterSummary,
    CitizenIssueStatusResponse,
    CitizenSubmitRequest,
    CitizenSubmitResponse,
    CitizenVerifyConfirmRequest,
    CitizenVerifyConfirmResponse,
    CitizenVerifyRequest,
    CitizenVerifyResponse,
)
from app.services.intake_pipeline import process_issue_intake
from app.tasks.intake import process_citizen_issue
from app.utils.auth_tokens import sign_payload, verify_token
from app.utils.hashing import sha256_hex

router = APIRouter(prefix="/api/citizen", tags=["citizen"])
settings = get_settings()

REQUIRED_SUBMISSION_CONSENTS = ("issue_storage", "mapping")


def _require_auth(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    return token


def _decode_token(token: str) -> dict:
    try:
        return verify_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


def _normalize_consents(payload: CitizenVerifyConfirmRequest) -> dict[str, bool]:
    return payload.consent_flags.model_dump()


def _anonymized_issue_text(issue_id: UUID) -> str:
    return f"[deleted by citizen request] issue:{issue_id}"


async def _get_constituency_or_404(db: AsyncSession, constituency_id: int) -> Constituency:
    result = await db.execute(select(Constituency).where(Constituency.id == constituency_id))
    constituency = result.scalar_one_or_none()
    if constituency is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Constituency not found")
    return constituency


async def _get_authenticated_citizen(db: AsyncSession, bearer_token: str) -> Citizen:
    token_payload = _decode_token(bearer_token)
    if token_payload.get("purpose") != "citizen_auth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid citizen token")

    citizen_id = UUID(token_payload["citizen_id"])
    citizen = await db.scalar(select(Citizen).where(Citizen.id == citizen_id))
    if citizen is None or not citizen.verified:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Citizen not verified")
    if citizen.blocked:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Citizen account blocked")
    return citizen


def _assert_submission_consents(citizen: Citizen) -> None:
    consent_flags = citizen.consent_flags or {}
    missing = [flag for flag in REQUIRED_SUBMISSION_CONSENTS if not consent_flags.get(flag, False)]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing required consent: {', '.join(missing)}",
        )


async def _process_or_queue_issue(db: AsyncSession, issue: Issue) -> str:
    redis = None
    try:
        redis = redis_from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        await asyncio.wait_for(redis.ping(), timeout=0.4)
    except Exception:
        if redis is not None:
            await redis.aclose()
        await process_issue_intake(db, issue.id)
        if issue.constituency_id is not None:
            await ClusteringAgent().run(db, issue.constituency_id)
        return "processed_inline"
    else:
        await redis.aclose()

    payload = {"issue_id": str(issue.id)}
    try:
        process_citizen_issue.delay(payload)
        return "queued"
    except (ConnectionError, KombuError, OSError):
        await process_issue_intake(db, issue.id)
        return "processed_inline"


async def create_verification_session(db: AsyncSession, payload: CitizenVerifyRequest) -> CitizenVerifyResponse:
    await _get_constituency_or_404(db, payload.constituency_id)
    session_token = sign_payload(
        {"mobile_e164": payload.mobile_e164, "constituency_id": payload.constituency_id, "purpose": "citizen_verify"},
        ttl_minutes=15,
    )
    return CitizenVerifyResponse(session_token=session_token)


async def confirm_verification_session(db: AsyncSession, payload: CitizenVerifyConfirmRequest) -> CitizenVerifyConfirmResponse:
    token_payload = _decode_token(payload.session_token)
    if token_payload.get("purpose") != "citizen_verify":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification token")
    if not payload.otp.isdigit():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP must be numeric")

    mobile_hash = sha256_hex(token_payload["mobile_e164"])
    constituency_id = int(token_payload["constituency_id"])
    await _get_constituency_or_404(db, constituency_id)

    consent_flags = _normalize_consents(payload)
    result = await db.execute(select(Citizen).where(Citizen.mobile_hash == mobile_hash))
    citizen = result.scalar_one_or_none()
    if citizen is None:
        citizen = Citizen(
            mobile_hash=mobile_hash,
            constituency_id=constituency_id,
            verified=True,
            consent_flags=consent_flags,
            age_verified=payload.age_verified,
            blocked=False,
            last_active=datetime.now(timezone.utc),
        )
        db.add(citizen)
        await db.flush()
    else:
        citizen.constituency_id = constituency_id
        citizen.verified = True
        citizen.consent_flags = consent_flags
        citizen.age_verified = payload.age_verified
        citizen.last_active = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(citizen)

    jwt = sign_payload(
        {"citizen_id": str(citizen.id), "constituency_id": constituency_id, "purpose": "citizen_auth"},
        ttl_minutes=60 * 24 * 7,
    )
    return CitizenVerifyConfirmResponse(citizen_id=str(citizen.id), jwt=jwt, consent_flags=payload.consent_flags)


async def submit_issue_for_citizen(
    db: AsyncSession, payload: CitizenSubmitRequest, bearer_token: str
) -> CitizenSubmitResponse:
    citizen = await _get_authenticated_citizen(db, bearer_token)
    if citizen.constituency_id != payload.constituency_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Constituency mismatch")

    _assert_submission_consents(citizen)
    await _get_constituency_or_404(db, payload.constituency_id)

    issue = Issue(
        citizen_id=citizen.id,
        constituency_id=payload.constituency_id,
        raw_text=payload.text,
        translated_text=None,
        source_language=payload.language,
        source_channel="web",
        issue_type=payload.category_hint,
        location_ward=payload.location,
    )
    db.add(issue)
    citizen.last_active = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(issue)

    processing_status = await _process_or_queue_issue(db, issue)
    if processing_status == "queued":
        await db.refresh(issue)

    return CitizenSubmitResponse(
        issue_id=str(issue.id),
        status="accepted",
        processing_status=processing_status,
        cluster_id=str(issue.cluster_id) if issue.cluster_id else None,
    )


async def fetch_issue_status_for_citizen(
    db: AsyncSession, issue_id: str, bearer_token: str
) -> CitizenIssueStatusResponse:
    citizen = await _get_authenticated_citizen(db, bearer_token)
    issue_uuid = UUID(issue_id)
    issue = await db.scalar(select(Issue).where(Issue.id == issue_uuid))
    if issue is None or issue.citizen_id != citizen.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    cluster_summary = None
    rank = None
    parliamentary_action = None
    if issue.cluster_id:
        cluster = await db.scalar(select(IssueCluster).where(IssueCluster.id == issue.cluster_id))
        if cluster is not None:
            cluster_summary = CitizenIssueClusterSummary(
                id=str(cluster.id),
                label=cluster.label,
                category=cluster.category,
                badge=cluster.badge,
                issue_count=cluster.issue_count,
            )
            ranking_rows = await db.scalars(
                select(IssueCluster.id)
                .where(IssueCluster.constituency_id == issue.constituency_id)
                .order_by(desc(IssueCluster.severity_avg), desc(IssueCluster.issue_count), desc(IssueCluster.last_updated))
            )
            for index, cluster_id in enumerate(ranking_rows.all(), start=1):
                if cluster_id == issue.cluster_id:
                    rank = index
                    break

            action = await db.scalar(
                select(ParliamentaryAction)
                .where(
                    ParliamentaryAction.cluster_id == issue.cluster_id,
                    ParliamentaryAction.constituency_id == issue.constituency_id,
                )
                .order_by(desc(ParliamentaryAction.created_at))
                .limit(1)
            )
            if action is not None:
                parliamentary_action = CitizenIssueActionSummary(
                    id=str(action.id),
                    action_type=action.action_type,
                    status=action.status,
                    filed_at=action.filed_at.isoformat() if action.filed_at else None,
                    session_reference=action.session_reference,
                )

    return CitizenIssueStatusResponse(
        issue_id=str(issue.id),
        cluster_membership=cluster_summary,
        rank=rank,
        parliamentary_action=parliamentary_action,
    )


async def file_dissent_for_citizen(
    db: AsyncSession, payload: CitizenDissentRequest, bearer_token: str
) -> CitizenDissentResponse:
    citizen = await _get_authenticated_citizen(db, bearer_token)
    action_uuid = UUID(payload.action_id)
    action = await db.scalar(select(ParliamentaryAction).where(ParliamentaryAction.id == action_uuid))
    if action is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parliamentary action not found")
    if action.constituency_id != citizen.constituency_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Action outside citizen constituency")

    dissent = DissentRecord(citizen_id=citizen.id, action_id=action.id, objection_text=payload.objection_text)
    db.add(dissent)
    citizen.last_active = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(dissent)
    return CitizenDissentResponse(dissent_id=str(dissent.id), status=dissent.status)


async def erase_citizen_data_for_citizen(db: AsyncSession, bearer_token: str) -> CitizenDataEraseResponse:
    citizen = await _get_authenticated_citizen(db, bearer_token)
    citizen_issue_ids = list(
        await db.scalars(select(Issue.id).where(Issue.citizen_id == citizen.id).order_by(Issue.created_at.desc()))
    )
    anonymized_issue_count = len(citizen_issue_ids)

    if citizen_issue_ids:
        for issue_id in citizen_issue_ids:
            await db.execute(
                update(Issue)
                .where(Issue.id == issue_id)
                .values(
                    citizen_id=None,
                    raw_text=_anonymized_issue_text(issue_id),
                    translated_text="[deleted by citizen request]",
                )
            )

    await db.execute(update(DissentRecord).where(DissentRecord.citizen_id == citizen.id).values(citizen_id=None))
    await db.execute(delete(Citizen).where(Citizen.id == citizen.id))
    await db.commit()
    return CitizenDataEraseResponse(status="deleted", anonymized_issue_count=anonymized_issue_count)


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


@router.get("/issue/{issue_id}", response_model=CitizenIssueStatusResponse)
async def get_citizen_issue(
    issue_id: str,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> CitizenIssueStatusResponse:
    bearer_token = _require_auth(authorization)
    return await fetch_issue_status_for_citizen(db, issue_id, bearer_token)


@router.post("/dissent", response_model=CitizenDissentResponse)
async def file_dissent(
    payload: CitizenDissentRequest,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> CitizenDissentResponse:
    bearer_token = _require_auth(authorization)
    return await file_dissent_for_citizen(db, payload, bearer_token)


@router.delete("/data", response_model=CitizenDataEraseResponse)
async def erase_citizen_data(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> CitizenDataEraseResponse:
    bearer_token = _require_auth(authorization)
    return await erase_citizen_data_for_citizen(db, bearer_token)
