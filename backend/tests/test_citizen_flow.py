from __future__ import annotations

from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException
from kombu.exceptions import KombuError
from sqlalchemy import delete, select

from app.database import AsyncSessionLocal
from app.models.citizen import Citizen
from app.models.dissent_record import DissentRecord
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.routers import citizen as citizen_router
from app.schemas.citizen import (
    CitizenDissentRequest,
    CitizenSubmitRequest,
    CitizenVerifyConfirmRequest,
    CitizenVerifyRequest,
    ConsentFlags,
)


async def _cleanup_records(
    *,
    citizen_id: UUID | None = None,
    issue_id: UUID | None = None,
    action_id: UUID | None = None,
    dissent_id: UUID | None = None,
) -> None:
    async with AsyncSessionLocal() as db:
        if dissent_id:
            await db.execute(delete(DissentRecord).where(DissentRecord.id == dissent_id))
        if action_id:
            await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.id == action_id))
        if issue_id:
            await db.execute(delete(Issue).where(Issue.id == issue_id))
        if citizen_id:
            await db.execute(delete(Citizen).where(Citizen.id == citizen_id))
        await db.commit()


@pytest.mark.asyncio(loop_scope="session")
async def test_citizen_verify_submit_dissent_and_erase_flow(monkeypatch: pytest.MonkeyPatch) -> None:
    created_citizen_id = None
    created_issue_id = None
    created_action_id = None
    created_dissent_id = None

    def fail_delay(_: dict) -> None:
        raise KombuError("broker unavailable")

    monkeypatch.setattr(citizen_router.process_citizen_issue, "delay", fail_delay)

    unique_mobile = f"+1555{str(uuid4().int)[:10]}"
    async with AsyncSessionLocal() as db:
        verify_response = await citizen_router.create_verification_session(
            db,
            CitizenVerifyRequest(mobile_e164=unique_mobile, constituency_id=1),
        )
        confirm_response = await citizen_router.confirm_verification_session(
            db,
            CitizenVerifyConfirmRequest(
                session_token=verify_response.session_token,
                otp="123456",
                consent_flags=ConsentFlags(
                    issue_storage=True,
                    mapping=True,
                    aggregation=True,
                    mp_brief=False,
                ),
                age_verified=True,
            ),
        )
        created_citizen_id = UUID(confirm_response.citizen_id)
        assert confirm_response.consent_flags.issue_storage is True

        submit_response = await citizen_router.submit_issue_for_citizen(
            db,
            CitizenSubmitRequest(
                text="The road outside the school has deep potholes and children are falling daily.",
                constituency_id=1,
                language="en",
                location="Ward 14",
            ),
            confirm_response.jwt,
        )
        created_issue_id = UUID(submit_response.issue_id)
        assert submit_response.processing_status == "processed_inline"

        issue = await db.scalar(select(Issue).where(Issue.id == created_issue_id))
        assert issue is not None
        assert issue.issue_type == "road"
        assert issue.ministry_mapped == "Ministry of Road Transport and Highways"
        assert issue.translated_text is not None
        assert issue.embedding is not None

        status_response = await citizen_router.fetch_issue_status_for_citizen(db, submit_response.issue_id, confirm_response.jwt)
        assert status_response.issue_id == submit_response.issue_id
        assert status_response.cluster_membership is None

        action = ParliamentaryAction(
            constituency_id=1,
            cluster_id=issue.cluster_id,
            action_type="question_unstarred",
            content="Will the Minister of Road Transport and Highways be pleased to state...",
            status="draft",
        )
        db.add(action)
        await db.commit()
        await db.refresh(action)
        created_action_id = action.id

        dissent_response = await citizen_router.file_dissent_for_citizen(
            db,
            CitizenDissentRequest(action_id=str(action.id), objection_text="Please do not generalize my ward issue without local context."),
            confirm_response.jwt,
        )
        created_dissent_id = UUID(dissent_response.dissent_id)
        assert dissent_response.status == "open"

        erase_response = await citizen_router.erase_citizen_data_for_citizen(db, confirm_response.jwt)
        assert erase_response.status == "deleted"
        assert erase_response.anonymized_issue_count == 1

        deleted_citizen = await db.scalar(select(Citizen).where(Citizen.id == created_citizen_id))
        assert deleted_citizen is None

        anonymized_issue = await db.scalar(select(Issue).where(Issue.id == created_issue_id))
        assert anonymized_issue is not None
        assert anonymized_issue.citizen_id is None
        assert "[deleted by citizen request]" in anonymized_issue.raw_text

        dissent_record = await db.scalar(select(DissentRecord).where(DissentRecord.id == created_dissent_id))
        assert dissent_record is not None
        assert dissent_record.citizen_id is None

    await _cleanup_records(
        citizen_id=created_citizen_id,
        issue_id=created_issue_id,
        action_id=created_action_id,
        dissent_id=created_dissent_id,
    )


@pytest.mark.asyncio(loop_scope="session")
async def test_submit_requires_issue_storage_and_mapping_consent() -> None:
    created_citizen_id = None
    try:
        unique_mobile = f"+1555{str(uuid4().int)[:10]}"
        async with AsyncSessionLocal() as db:
            verify_response = await citizen_router.create_verification_session(
                db,
                CitizenVerifyRequest(mobile_e164=unique_mobile, constituency_id=1),
            )
            confirm_response = await citizen_router.confirm_verification_session(
                db,
                CitizenVerifyConfirmRequest(
                    session_token=verify_response.session_token,
                    otp="123456",
                    consent_flags=ConsentFlags(
                        issue_storage=False,
                        mapping=True,
                        aggregation=False,
                        mp_brief=False,
                    ),
                    age_verified=True,
                ),
            )
            created_citizen_id = UUID(confirm_response.citizen_id)

            with pytest.raises(HTTPException) as exc_info:
                await citizen_router.submit_issue_for_citizen(
                    db,
                    CitizenSubmitRequest(text="No water supply in our lane.", constituency_id=1, language="en"),
                    confirm_response.jwt,
                )

            assert exc_info.value.status_code == 403
            assert "Missing required consent" in exc_info.value.detail
    finally:
        if created_citizen_id is not None:
            await _cleanup_records(citizen_id=created_citizen_id)
