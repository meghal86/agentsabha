from __future__ import annotations

from pydantic import BaseModel


class SansadDarpanSection(BaseModel):
    slug: str
    title: str
    hindi_title: str
    summary: str
    metric_label: str
    metric_value: str
    href: str
    layer: str


class SansadDarpanOverviewResponse(BaseModel):
    product_name: str
    hindi_name: str
    tagline: str
    launch_window: str
    primary_users: list[str]
    layer_placement: str
    sections: list[SansadDarpanSection]


class SansadDarpanMpCard(BaseModel):
    slug: str
    name: str
    constituency: str
    state: str
    party: str
    attendance_rate: float
    questions_asked: int
    debates: int
    score: int
    national_rank: int
    summary: str


class SansadDarpanMpListResponse(BaseModel):
    methodology_version: str
    mps: list[SansadDarpanMpCard]


class SansadDarpanMpProfileResponse(SansadDarpanMpCard):
    zero_hour_mentions: int
    private_member_bills: int
    voting_participation: float
    score_breakdown: dict[str, float]
    sources: list[str]
    narrative: str
    og_ready: bool


class SansadDarpanWelfareMetric(BaseModel):
    label: str
    value: str
    benchmark: str
    status: str


class SansadDarpanConstituencyCard(BaseModel):
    slug: str
    name: str
    state: str
    mp_name: str
    top_gap: str
    raised_in_parliament: bool
    metrics: list[SansadDarpanWelfareMetric]


class SansadDarpanConstituencyListResponse(BaseModel):
    update_frequency: str
    constituencies: list[SansadDarpanConstituencyCard]


class SansadDarpanRuleDeviationCard(BaseModel):
    id: str
    title: str
    session_label: str
    rule_reference: str
    confidence: float
    status: str
    summary: str


class SansadDarpanRuleDeviationListResponse(BaseModel):
    human_review_required: bool
    deviations: list[SansadDarpanRuleDeviationCard]


class SansadDarpanRuleDeviationDetailResponse(SansadDarpanRuleDeviationCard):
    analysis: str
    primary_sources: list[str]
    review_notes: list[str]


class SansadDarpanMethodologySection(BaseModel):
    title: str
    body: str


class SansadDarpanMethodologyResponse(BaseModel):
    title: str
    principles: list[str]
    sections: list[SansadDarpanMethodologySection]
