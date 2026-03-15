from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.agent_log import AgentLog
from app.utils.internal_auth import require_bearer_token, require_purpose

router = APIRouter(prefix="/api/admin", tags=["admin"])


class PausePipelineRequest(BaseModel):
    reason: str = Field(min_length=5)


@router.get("/agents/health")
async def admin_agents_health(
    authorization: Optional[str] = Header(default=None), db: AsyncSession = Depends(get_db)
) -> dict:
    require_purpose(require_bearer_token(authorization), "admin_auth")
    rows = (
        await db.execute(
            select(AgentLog).order_by(desc(AgentLog.created_at)).limit(100)
        )
    ).scalars().all()
    latest_by_agent: dict[str, AgentLog] = {}
    for row in rows:
        latest_by_agent.setdefault(row.agent_type, row)
    return {
        "agents": [
            {
                "agent_type": agent_type,
                "last_run": log.created_at.isoformat(),
                "last_action": log.action,
                "error_code": log.error_code,
                "constituency_id": log.constituency_id,
            }
            for agent_type, log in sorted(latest_by_agent.items())
        ]
    }


@router.post("/pipeline/pause")
async def pause_pipeline(
    payload: PausePipelineRequest,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    require_purpose(require_bearer_token(authorization), "admin_auth")
    db.add(
        AgentLog(
            agent_type="distribution",
            constituency_id=None,
            action=f"pipeline_paused:{payload.reason}",
            input_hash="manual",
            output_hash="manual",
            model_version="system",
            tokens_used=0,
            latency_ms=0,
            error_code=None,
        )
    )
    await db.commit()
    return {"status": "paused_logged", "reason": payload.reason}
