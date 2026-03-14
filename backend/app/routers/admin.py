from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _require_admin(authorization: Optional[str]) -> None:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin authorization required")


@router.get("/agents/health")
async def admin_agents_health(authorization: Optional[str] = Header(default=None)) -> dict:
    _require_admin(authorization)
    return {"agents": []}


@router.post("/pipeline/pause")
async def pause_pipeline(authorization: Optional[str] = Header(default=None)) -> dict:
    _require_admin(authorization)
    return {"status": "paused_logged"}
