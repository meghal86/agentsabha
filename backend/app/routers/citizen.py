from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status

router = APIRouter(prefix="/api/citizen", tags=["citizen"])


def _require_auth(authorization: Optional[str]) -> None:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")


@router.post("/submit")
async def submit_issue() -> dict:
    return {"status": "accepted", "message": "Submission pipeline scaffolded"}


@router.post("/verify")
async def verify_citizen() -> dict:
    return {"session_token": "sandbox-session-token"}


@router.post("/verify/confirm")
async def confirm_citizen_verification() -> dict:
    return {"citizen_id": None, "jwt": None}


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
