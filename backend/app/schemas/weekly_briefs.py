from __future__ import annotations

from pydantic import BaseModel


class WeeklyBriefGap(BaseModel):
    title: str
    detail: str
    why_it_matters: str


class WeeklyBriefAuditHook(BaseModel):
    title: str
    body: str
    source_label: str


class WeeklyBriefParliamentaryMove(BaseModel):
    title: str
    body: str
    draft_question: str


class WeeklyBriefNarrativeBlock(BaseModel):
    title: str
    body: str


class WeeklyBriefSource(BaseModel):
    label: str
    note: str


class WeeklyBriefCard(BaseModel):
    slug: str
    constituency_slug: str
    week_label: str
    publish_date: str
    constituency: str
    state: str
    mp_name: str
    mp_party: str
    headline: str
    summary: str


class WeeklyBriefDetail(WeeklyBriefCard):
    hero_note: str
    welfare_gaps: list[WeeklyBriefGap]
    audit_hook: WeeklyBriefAuditHook
    parliamentary_move: WeeklyBriefParliamentaryMove
    anomaly: WeeklyBriefNarrativeBlock
    sdg_trend: WeeklyBriefNarrativeBlock
    mp_summary: list[str]
    video_segments: list[WeeklyBriefNarrativeBlock]
    source_trail: list[WeeklyBriefSource]


class WeeklyBriefListResponse(BaseModel):
    briefs: list[WeeklyBriefCard]
