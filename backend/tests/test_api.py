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


def test_citizen_issue_requires_auth() -> None:
    response = client.get("/api/citizen/issue/example-issue")
    assert response.status_code == 401
