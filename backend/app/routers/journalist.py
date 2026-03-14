from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status

router = APIRouter(prefix="/api/journalist", tags=["journalist"])


def _require_journalist_key(api_key: Optional[str]) -> None:
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Journalist API key required")


@router.get("/package/{week_date}")
async def get_journalist_package(week_date: str, x_api_key: Optional[str] = Header(default=None)) -> dict:
    _require_journalist_key(x_api_key)
    return {"week_date": week_date, "stories": [], "charts": []}


@router.get("/constituency/{id}/data")
async def get_journalist_constituency_data(id: int, x_api_key: Optional[str] = Header(default=None)) -> dict:
    _require_journalist_key(x_api_key)
    return {"constituency_id": id, "clusters": [], "trends": [], "actions": []}
