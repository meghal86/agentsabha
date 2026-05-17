from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class AnonIntakeRequest(BaseModel):
    constituency_id: int = Field(ge=1, le=543)
    text: str = Field(min_length=1, max_length=10000)
    category_hint: Optional[str] = None
    language: Optional[str] = None
    location: Optional[str] = None


class AnonIntakeResponse(BaseModel):
    issue_id: str
    status: str
