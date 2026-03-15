from __future__ import annotations

from datetime import date

import pytest
from sqlalchemy import delete, select

from app.database import AsyncSessionLocal, engine
from app.models.agent_log import AgentLog
from app.models.mp_brief import MPBrief
from app.models.parliamentary_action import ParliamentaryAction
from app.routers import admin, journalist, mp
from app.utils.auth_tokens import sign_payload


TEST_CONSTITUENCY_ID = 4


async def _cleanup() -> None:
    await engine.dispose()
    async with AsyncSessionLocal() as db:
        await db.execute(delete(MPBrief).where(MPBrief.constituency_id == TEST_CONSTITUENCY_ID))
        await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.constituency_id == TEST_CONSTITUENCY_ID))
        await db.execute(delete(AgentLog).where(AgentLog.constituency_id == TEST_CONSTITUENCY_ID))
        await db.commit()
    await engine.dispose()


@pytest.mark.asyncio
async def test_internal_routes_return_db_backed_data() -> None:
    await _cleanup()
    created_action_id: str | None = None
    try:
        async with AsyncSessionLocal() as db:
            action = ParliamentaryAction(
                constituency_id=TEST_CONSTITUENCY_ID,
                action_type="question_unstarred",
                content="Will the Minister be pleased to state the current road repair status?",
                status="draft",
                lok_sabha_rule="Rule 32",
                ministry="Ministry of Road Transport and Highways",
            )
            db.add(action)
            brief = MPBrief(
                constituency_id=TEST_CONSTITUENCY_ID,
                week_date=date(2026, 3, 20),
                brief_content={"header": {"constituency": "Test Seat"}},
                brief_pdf_url="/tmp/test-brief.pdf",
                delivery_status="pending",
            )
            db.add(brief)
            db.add(
                AgentLog(
                    agent_type="intake",
                    constituency_id=TEST_CONSTITUENCY_ID,
                    action="issue_processed",
                    input_hash="a",
                    output_hash="b",
                    model_version="test",
                    tokens_used=1,
                    latency_ms=1,
                    error_code=None,
                )
            )
            await db.commit()
            await db.refresh(action)
            created_action_id = str(action.id)

            mp_token = sign_payload({"purpose": "mp_auth", "constituency_id": TEST_CONSTITUENCY_ID}, ttl_minutes=60)
            journalist_token = sign_payload({"purpose": "journalist_api"}, ttl_minutes=60)
            admin_token = sign_payload({"purpose": "admin_auth"}, ttl_minutes=60)

            mp_brief_response = await mp.get_mp_brief(TEST_CONSTITUENCY_ID, f"Bearer {mp_token}", db)
            assert mp_brief_response["current_week"] is not None

            mp_actions_response = await mp.get_mp_actions(TEST_CONSTITUENCY_ID, f"Bearer {mp_token}", db)
            assert len(mp_actions_response["actions"]) == 1

            approve_response = await mp.approve_action(created_action_id, f"Bearer {mp_token}", db)
            assert approve_response["mp_approved"] is True

            journalist_response = await journalist.get_journalist_constituency_data(
                TEST_CONSTITUENCY_ID, journalist_token, db
            )
            assert journalist_response["actions"][0]["status"] in {"draft", "submitted_to_mp"}

            admin_response = await admin.admin_agents_health(f"Bearer {admin_token}", db)
            assert any(agent["agent_type"] == "intake" for agent in admin_response["agents"])
    finally:
        await _cleanup()
