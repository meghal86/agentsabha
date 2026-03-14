from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status

router = APIRouter(prefix="/api/mp", tags=["mp"])


def _require_mp_auth(authorization: Optional[str]) -> None:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="MP authorization required")


@router.get("/brief/{constituency_id}")
async def get_mp_brief(constituency_id: int, authorization: Optional[str] = Header(default=None)) -> dict:
    _require_mp_auth(authorization)
    return {"constituency_id": constituency_id, "current_week": None, "history": []}


@router.get("/actions/{constituency_id}")
async def get_mp_actions(constituency_id: int, authorization: Optional[str] = Header(default=None)) -> dict:
    _require_mp_auth(authorization)
    return {"constituency_id": constituency_id, "actions": []}


@router.post("/action/{action_id}/approve")
async def approve_action(action_id: str, authorization: Optional[str] = Header(default=None)) -> dict:
    _require_mp_auth(authorization)
    return {"action_id": action_id, "status": "approved_pending_workflow"}
