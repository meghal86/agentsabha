from fastapi.testclient import TestClient

from app.main import app
from app.routers import public
from app.schemas.public import ConstituencyDirectoryResponse, ConstituencySummary


client = TestClient(app)


def test_public_constituency_endpoint() -> None:
    async def fake_summary(_, constituency_id: int) -> ConstituencySummary:
        return ConstituencySummary(id=constituency_id, name="Kangra", state="Himachal Pradesh", mp_name=None, mp_party=None, population=None)

    public.fetch_constituency_summary = fake_summary  # type: ignore[assignment]
    response = client.get("/api/constituency/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_public_constituency_directory_endpoint() -> None:
    async def fake_directory(_) -> ConstituencyDirectoryResponse:
        return ConstituencyDirectoryResponse(
            constituencies=[
                {
                    "id": 1,
                    "name": "Kangra",
                    "state": "Himachal Pradesh",
                    "mp_name": None,
                    "lat": 32.1,
                    "lng": 76.2,
                }
            ]
        )

    public.fetch_constituency_directory = fake_directory  # type: ignore[assignment]
    response = client.get("/api/constituencies")
    assert response.status_code == 200
    assert response.json()["constituencies"][0]["name"] == "Kangra"


def test_public_debug_agents_endpoint() -> None:
    async def fake_debug_agents(_) -> dict:
        return {
            "agents": [
                {
                    "agent_type": "intake",
                    "last_run": "2026-03-15T00:00:00+00:00",
                    "last_action": "processed_issue",
                    "error_code": None,
                    "recent_runs": 3,
                    "active_constituencies": [502],
                }
            ]
        }

    public.fetch_debug_agents = fake_debug_agents  # type: ignore[assignment]
    response = client.get("/api/debug/agents")
    assert response.status_code == 200
    assert response.json()["agents"][0]["agent_type"] == "intake"


def test_citizen_issue_requires_auth() -> None:
    response = client.get("/api/citizen/issue/example-issue")
    assert response.status_code == 401
