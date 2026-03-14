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
