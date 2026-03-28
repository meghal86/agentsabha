from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.routers import sansaddarpan
from app.schemas.sansaddarpan import SansadDarpanMpListResponse, SansadDarpanOverviewResponse


client = TestClient(app)


def test_sansaddarpan_overview_route_uses_helper(monkeypatch) -> None:
    def fake_overview() -> SansadDarpanOverviewResponse:
        return SansadDarpanOverviewResponse(
            product_name="SansadDarpan",
            hindi_name="सांसद दर्पण",
            tagline="Test overview",
            launch_window="3 months",
            primary_users=["Journalists"],
            layer_placement="Layer 3",
            sections=[],
        )

    monkeypatch.setattr(sansaddarpan, "fetch_sansaddarpan_overview", fake_overview)

    response = client.get("/api/sansaddarpan")
    assert response.status_code == 200
    assert response.json()["product_name"] == "SansadDarpan"


def test_sansaddarpan_mps_route_uses_helper(monkeypatch) -> None:
    async def fake_mps(_) -> SansadDarpanMpListResponse:
        return SansadDarpanMpListResponse(methodology_version="v-test", mps=[])

    monkeypatch.setattr(sansaddarpan, "fetch_sansaddarpan_mps", fake_mps)

    response = client.get("/api/sansaddarpan/mps")
    assert response.status_code == 200
    assert response.json()["methodology_version"] == "v-test"


def test_sansaddarpan_mp_detail_route_uses_helper(monkeypatch) -> None:
    async def fake_mp(_, slug: str):
        return sansaddarpan._fallback_mp_profile(slug)

    monkeypatch.setattr(sansaddarpan, "fetch_sansaddarpan_mp", fake_mp)

    response = client.get("/api/sansaddarpan/mps/rahul-gandhi")
    assert response.status_code == 200
    assert response.json()["slug"] == "rahul-gandhi"


def test_sansaddarpan_mp_detail_404() -> None:
    response = client.get("/api/sansaddarpan/mps/does-not-exist")
    assert response.status_code == 404
