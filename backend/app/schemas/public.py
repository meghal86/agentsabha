from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class ConstituencySummary(BaseModel):
    id: int
    name: str
    state: str
    mp_name: Optional[str]
    mp_party: Optional[str]
    population: Optional[int]


class ClusterSummary(BaseModel):
    label: Optional[str]
    count: int
    severity: Optional[float]
    badge: Optional[str]
    velocity: Optional[float]
    category: Optional[str] = None


class ConstituencyIssuesResponse(BaseModel):
    constituency_id: int
    clusters: list[ClusterSummary]
    total: int
    page: int


class HeatmapPoint(BaseModel):
    id: int
    lat: Optional[float]
    lng: Optional[float]
    severity_score: Optional[float]
    top_category: Optional[str]


class HeatmapResponse(BaseModel):
    constituencies: list[HeatmapPoint]


class TimelineDatum(BaseModel):
    week: str
    count: int
    severity_avg: Optional[float]


class ConstituencyTimelineSeries(BaseModel):
    category: str
    data: list[TimelineDatum]


class ConstituencyTimelineResponse(BaseModel):
    constituency_id: int
    timeline: list[ConstituencyTimelineSeries]


class ParliamentaryActionSummary(BaseModel):
    type: Optional[str]
    content: str
    status: str
    filed_at: Optional[str]
    response_text: Optional[str]


class ConstituencyActionsResponse(BaseModel):
    constituency_id: int
    actions: list[ParliamentaryActionSummary]


class NationalPulseIssue(BaseModel):
    label: str
    constituency_count: int
    avg_severity: Optional[float]
    total_reports: int


class NationalPulseResponse(BaseModel):
    issues: list[NationalPulseIssue]


class WeeklyAuditResponse(BaseModel):
    week: Optional[str]
    geographic_balance: dict[str, int]
    party_distribution: dict[str, int]
    fact_check_stats: dict[str, int]
