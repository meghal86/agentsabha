from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ConsentFlags(BaseModel):
    issue_storage: bool
    mapping: bool
    aggregation: bool
    mp_brief: bool


class CitizenVerifyRequest(BaseModel):
    mobile_e164: str = Field(min_length=8, max_length=20)
    constituency_id: int = Field(ge=1, le=543)


class CitizenVerifyResponse(BaseModel):
    session_token: str


class CitizenVerifyConfirmRequest(BaseModel):
    session_token: str
    otp: str = Field(min_length=4, max_length=8)
    consent_flags: ConsentFlags
    age_verified: bool = False


class CitizenVerifyConfirmResponse(BaseModel):
    citizen_id: str
    jwt: str
    consent_flags: ConsentFlags


class CitizenSubmitRequest(BaseModel):
    text: str = Field(min_length=1)
    constituency_id: int = Field(ge=1, le=543)
    language: Optional[str] = None
    location: Optional[str] = None
    category_hint: Optional[str] = None


class CitizenSubmitResponse(BaseModel):
    issue_id: str
    status: str
    processing_status: str
    cluster_id: Optional[str] = None


class CitizenIssueClusterSummary(BaseModel):
    id: str
    label: Optional[str] = None
    category: Optional[str] = None
    badge: Optional[str] = None
    issue_count: int = 0


class CitizenIssueActionSummary(BaseModel):
    id: str
    action_type: Optional[str] = None
    status: str
    filed_at: Optional[str] = None
    session_reference: Optional[str] = None


class CitizenIssueStatusResponse(BaseModel):
    issue_id: str
    cluster_membership: Optional[CitizenIssueClusterSummary] = None
    rank: Optional[int] = None
    parliamentary_action: Optional[CitizenIssueActionSummary] = None


class CitizenDissentRequest(BaseModel):
    action_id: str
    objection_text: str = Field(min_length=3)


class CitizenDissentResponse(BaseModel):
    dissent_id: str
    status: str


class CitizenDataEraseResponse(BaseModel):
    status: str
    anonymized_issue_count: int
