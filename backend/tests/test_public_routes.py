from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.routers import public
from app.schemas.public import (
    ConstituencyActionsResponse,
    ConstituencyIssuesResponse,
    ConstituencySummary,
    ConstituencyTimelineResponse,
    HeatmapResponse,
    NationalPulseResponse,
    WeeklyAuditResponse,
)


client = TestClient(app)


def test_get_constituency_route_uses_summary_helper(monkeypatch) -> None:
    async def fake_summary(_, constituency_id: int) -> ConstituencySummary:
        return ConstituencySummary(id=constituency_id, name="Varanasi", state="Uttar Pradesh", mp_name="Test MP", mp_party="Independent", population=123456)

    monkeypatch.setattr(public, "fetch_constituency_summary", fake_summary)

    response = client.get("/api/constituency/77")
    assert response.status_code == 200
    assert response.json()["name"] == "Varanasi"


def test_get_constituency_issues_route_uses_cluster_helper(monkeypatch) -> None:
    async def fake_clusters(_, constituency_id: int, page: int, per_page: int) -> ConstituencyIssuesResponse:
        return ConstituencyIssuesResponse(
            constituency_id=constituency_id,
            total=1,
            page=page,
            clusters=[{"label": "Road safety", "count": 75, "severity": 8.4, "badge": "tatkal", "velocity": 32.0, "category": "road"}],
        )

    monkeypatch.setattr(public, "fetch_constituency_clusters", fake_clusters)

    response = client.get("/api/constituency/77/issues?page=2")
    assert response.status_code == 200
    assert response.json()["page"] == 2
    assert response.json()["clusters"][0]["badge"] == "tatkal"


def test_heatmap_route_uses_query_helper(monkeypatch) -> None:
    async def fake_heatmap(_) -> HeatmapResponse:
        return HeatmapResponse(constituencies=[{"id": 1, "lat": 25.3, "lng": 82.9, "severity_score": 7.2, "top_category": "road"}])

    monkeypatch.setattr(public, "fetch_national_heatmap", fake_heatmap)

    response = client.get("/api/national/heatmap")
    assert response.status_code == 200
    assert response.json()["constituencies"][0]["top_category"] == "road"


def test_timeline_route_uses_query_helper(monkeypatch) -> None:
    async def fake_timeline(_, constituency_id: int) -> ConstituencyTimelineResponse:
        return ConstituencyTimelineResponse(
            constituency_id=constituency_id,
            timeline=[{"category": "road", "data": [{"week": "2026-03-09", "count": 12, "severity_avg": 7.4}]}],
        )

    monkeypatch.setattr(public, "fetch_constituency_timeline", fake_timeline)

    response = client.get("/api/constituency/77/timeline")
    assert response.status_code == 200
    assert response.json()["timeline"][0]["category"] == "road"


def test_actions_route_uses_query_helper(monkeypatch) -> None:
    async def fake_actions(_, constituency_id: int) -> ConstituencyActionsResponse:
        return ConstituencyActionsResponse(
            constituency_id=constituency_id,
            actions=[
                {
                    "type": "question_unstarred",
                    "content": "Will the Minister be pleased to state...",
                    "status": "filed",
                    "filed_at": "2026-03-14T10:00:00+00:00",
                    "response_text": None,
                }
            ],
        )

    monkeypatch.setattr(public, "fetch_constituency_actions", fake_actions)

    response = client.get("/api/constituency/77/actions")
    assert response.status_code == 200
    assert response.json()["actions"][0]["status"] == "filed"


def test_national_pulse_route_uses_query_helper(monkeypatch) -> None:
    async def fake_pulse(_) -> NationalPulseResponse:
        return NationalPulseResponse(
            issues=[{"label": "Road safety", "constituency_count": 3, "avg_severity": 8.1, "total_reports": 182}]
        )

    monkeypatch.setattr(public, "fetch_national_pulse", fake_pulse)

    response = client.get("/api/national/pulse")
    assert response.status_code == 200
    assert response.json()["issues"][0]["constituency_count"] == 3


def test_weekly_audit_route_uses_query_helper(monkeypatch) -> None:
    async def fake_audit(_) -> WeeklyAuditResponse:
        return WeeklyAuditResponse(
            week="2026-03-14",
            geographic_balance={"north": 4},
            party_distribution={"Independent": 2},
            fact_check_stats={"total_runs": 0, "successful_runs": 0},
        )

    monkeypatch.setattr(public, "fetch_weekly_audit", fake_audit)

    response = client.get("/api/audit/weekly")
    assert response.status_code == 200
    assert response.json()["geographic_balance"]["north"] == 4
