from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status

from app.utils.auth_tokens import verify_token


def require_bearer_token(authorization: Optional[str]) -> dict:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization required")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")
    try:
        return verify_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


def require_purpose(payload: dict, purpose: str) -> dict:
    if payload.get("purpose") != purpose:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token purpose, expected {purpose}")
    return payload


def require_constituency_scope(payload: dict, constituency_id: int) -> None:
    scoped = payload.get("constituency_id")
    if scoped is not None and int(scoped) != constituency_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Constituency scope mismatch")


def require_api_key_token(api_key: Optional[str], purpose: str) -> dict:
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API key required")
    try:
        payload = verify_token(api_key)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return require_purpose(payload, purpose)
