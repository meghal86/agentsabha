from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class CitizenVerifyRequest(BaseModel):
    mobile_e164: str = Field(min_length=8, max_length=20)
    constituency_id: int = Field(ge=1, le=543)


class CitizenVerifyResponse(BaseModel):
    session_token: str


class CitizenVerifyConfirmRequest(BaseModel):
    session_token: str
    otp: str = Field(min_length=4, max_length=8)


class CitizenVerifyConfirmResponse(BaseModel):
    citizen_id: str
    jwt: str


class CitizenSubmitRequest(BaseModel):
    text: str = Field(min_length=1)
    constituency_id: int = Field(ge=1, le=543)
    language: Optional[str] = None
    location: Optional[str] = None


class CitizenSubmitResponse(BaseModel):
    issue_id: str
    status: str
    cluster_id: Optional[str] = None

