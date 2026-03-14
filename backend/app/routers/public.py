from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from redis.asyncio import from_url as redis_from_url
from sqlalchemy import and_, desc, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.schemas.health import HealthResponse
from app.schemas.public import ConstituencyIssuesResponse, ConstituencySummary, HeatmapResponse
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency

router = APIRouter()
settings = get_settings()


def _decimal_to_float(value: Decimal | None) -> float | None:
    return float(value) if value is not None else None


async def fetch_constituency_summary(db: AsyncSession, constituency_id: int) -> ConstituencySummary:
    result = await db.execute(select(Constituency).where(Constituency.id == constituency_id))
    constituency = result.scalar_one_or_none()
    if constituency is None:
        raise HTTPException(status_code=404, detail="Constituency not found")

    return ConstituencySummary(
        id=constituency.id,
        name=constituency.name,
        state=constituency.state,
        mp_name=constituency.mp_name,
        mp_party=constituency.mp_party,
        population=constituency.population,
    )


async def fetch_constituency_clusters(
    db: AsyncSession, constituency_id: int, page: int, per_page: int
) -> ConstituencyIssuesResponse:
    threshold = settings.correct_constituency_minimum_cluster_size
    base_query = (
        select(IssueCluster)
        .where(IssueCluster.constituency_id == constituency_id, IssueCluster.issue_count >= threshold)
        .order_by(desc(IssueCluster.severity_avg).nullslast(), desc(IssueCluster.issue_count), IssueCluster.last_updated.desc())
    )
    count_query = (
        select(func.count())
        .select_from(IssueCluster)
        .where(IssueCluster.constituency_id == constituency_id, IssueCluster.issue_count >= threshold)
    )

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(base_query.offset((page - 1) * per_page).limit(per_page))
    rows = result.scalars().all()

    return ConstituencyIssuesResponse(
        constituency_id=constituency_id,
        total=total,
        page=page,
        clusters=[
            {
                "label": row.label,
                "count": row.issue_count,
                "severity": _decimal_to_float(row.severity_avg),
                "badge": row.badge,
                "velocity": _decimal_to_float(row.velocity),
                "category": row.category,
            }
            for row in rows
        ],
    )


async def fetch_national_heatmap(db: AsyncSession) -> HeatmapResponse:
    ranked_clusters = (
        select(
            IssueCluster.constituency_id.label("constituency_id"),
            IssueCluster.category.label("top_category"),
            IssueCluster.severity_avg.label("severity_score"),
            func.row_number()
            .over(
                partition_by=IssueCluster.constituency_id,
                order_by=(desc(IssueCluster.issue_count), desc(IssueCluster.severity_avg).nullslast()),
            )
            .label("row_rank"),
        )
        .where(IssueCluster.issue_count >= settings.correct_constituency_minimum_cluster_size)
        .subquery()
    )
    stmt = (
        select(
            Constituency.id,
            Constituency.lat,
            Constituency.lng,
            ranked_clusters.c.severity_score,
            ranked_clusters.c.top_category,
        )
        .outerjoin(
            ranked_clusters,
            and_(ranked_clusters.c.constituency_id == Constituency.id, ranked_clusters.c.row_rank == 1),
        )
        .order_by(Constituency.id)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return HeatmapResponse(
        constituencies=[
            {
                "id": row.id,
                "lat": _decimal_to_float(row.lat),
                "lng": _decimal_to_float(row.lng),
                "severity_score": _decimal_to_float(row.severity_score),
                "top_category": row.top_category,
            }
            for row in rows
        ]
    )


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


@router.get("/api/constituency/{id}", response_model=ConstituencySummary)
async def get_constituency(id: int, db: AsyncSession = Depends(get_db)) -> ConstituencySummary:
    return await fetch_constituency_summary(db, id)


@router.get("/api/constituency/{id}/issues", response_model=ConstituencyIssuesResponse)
async def get_constituency_issues(
    id: int,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> ConstituencyIssuesResponse:
    return await fetch_constituency_clusters(db, id, page, per_page)


@router.get("/api/constituency/{id}/timeline")
async def get_constituency_timeline(id: int) -> dict:
    return {"constituency_id": id, "timeline": []}


@router.get("/api/constituency/{id}/actions")
async def get_constituency_actions(id: int) -> dict:
    return {"constituency_id": id, "actions": []}


@router.get("/api/national/pulse")
async def get_national_pulse() -> dict:
    return {"issues": []}


@router.get("/api/national/heatmap", response_model=HeatmapResponse)
async def get_national_heatmap(db: AsyncSession = Depends(get_db)) -> HeatmapResponse:
    return await fetch_national_heatmap(db)


@router.get("/api/audit/weekly")
async def get_weekly_audit() -> dict:
    return {"week": None, "geographic_balance": {}, "party_distribution": {}, "fact_check_stats": {}}
