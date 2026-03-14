from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from redis.asyncio import from_url as redis_from_url

from app.config import get_settings
from app.database import get_db
from app.schemas.health import HealthResponse

router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    db_status = "ok"
    redis_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    try:
        redis = redis_from_url(settings.redis_url, encoding="utf-8", decode_responses=True)
        await redis.ping()
        await redis.aclose()
    except Exception:
        redis_status = "error"

    status = "ok" if db_status == "ok" and redis_status == "ok" else "degraded"
    return HealthResponse(status=status, db=db_status, redis=redis_status, agents_active=3, version=settings.api_version)


@router.get("/api/constituency/{id}")
async def get_constituency(id: int) -> dict:
    return {"id": id, "name": f"Constituency {id}", "state": "Unknown", "mp_name": None, "mp_party": None, "population": None}


@router.get("/api/constituency/{id}/issues")
async def get_constituency_issues(id: int) -> dict:
    return {"constituency_id": id, "clusters": [], "total": 0, "page": 1}


@router.get("/api/constituency/{id}/timeline")
async def get_constituency_timeline(id: int) -> dict:
    return {"constituency_id": id, "timeline": []}


@router.get("/api/constituency/{id}/actions")
async def get_constituency_actions(id: int) -> dict:
    return {"constituency_id": id, "actions": []}


@router.get("/api/national/pulse")
async def get_national_pulse() -> dict:
    return {"issues": []}


@router.get("/api/national/heatmap")
async def get_national_heatmap() -> dict:
    return {"constituencies": []}


@router.get("/api/audit/weekly")
async def get_weekly_audit() -> dict:
    return {"week": None, "geographic_balance": {}, "party_distribution": {}, "fact_check_stats": {}}

