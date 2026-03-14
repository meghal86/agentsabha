from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.routers import public
from app.schemas.public import ConstituencyIssuesResponse, ConstituencySummary, HeatmapResponse


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

