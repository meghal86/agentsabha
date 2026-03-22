from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from redis.asyncio import from_url as redis_from_url
from sqlalchemy import and_, case, desc, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models.agent_log import AgentLog
from app.schemas.health import HealthResponse
from app.schemas.public import (
    ConstituencyDeskResponse,
    ConstituencyDirectoryResponse,
    ConstituencyActionsResponse,
    ConstituencyCategoryCount,
    ConstituencyDirectoryItem,
    ConstituencyIssuesResponse,
    ConstituencyRecentIssue,
    ConstituencySummary,
    ConstituencyTimelineResponse,
    HeatmapResponse,
    NationalPulseResponse,
    WeeklyAuditResponse,
)
from app.models.cluster import IssueCluster
from app.models.constituency import Constituency
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction

router = APIRouter()
settings = get_settings()
DISPLAY_NAME_OVERRIDES = {
    "Bangalore South": "Bengaluru South",
    "Gurgaon": "Gurugram",
}


def _decimal_to_float(value: Decimal | None) -> float | None:
    return float(value) if value is not None else None


def _display_constituency_name(name: str | None) -> str | None:
    if name is None:
        return None
    return DISPLAY_NAME_OVERRIDES.get(name, name)


async def fetch_constituency_summary(db: AsyncSession, constituency_id: int) -> ConstituencySummary:
    result = await db.execute(select(Constituency).where(Constituency.id == constituency_id))
    constituency = result.scalar_one_or_none()
    if constituency is None:
        raise HTTPException(status_code=404, detail="Constituency not found")

    return ConstituencySummary(
        id=constituency.id,
        name=_display_constituency_name(constituency.name),
        state=constituency.state,
        mp_name=constituency.mp_name,
        mp_party=constituency.mp_party,
        population=constituency.population,
    )


async def fetch_constituency_directory(db: AsyncSession) -> ConstituencyDirectoryResponse:
    result = await db.execute(select(Constituency).order_by(Constituency.state, Constituency.name))
    rows = result.scalars().all()
    return ConstituencyDirectoryResponse(
        constituencies=[
            ConstituencyDirectoryItem(
                id=row.id,
                name=_display_constituency_name(row.name),
                state=row.state,
                mp_name=row.mp_name,
                lat=_decimal_to_float(row.lat),
                lng=_decimal_to_float(row.lng),
            )
            for row in rows
        ]
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


def _preview_text(value: str | None) -> str:
    text_value = (value or "").strip()
    if len(text_value) <= 140:
        return text_value
    return f"{text_value[:137].rstrip()}..."


async def fetch_constituency_desk(db: AsyncSession, constituency_id: int) -> ConstituencyDeskResponse:
    await fetch_constituency_summary(db, constituency_id)

    raw_issue_count = (
        await db.execute(select(func.count()).select_from(Issue).where(Issue.constituency_id == constituency_id))
    ).scalar_one()
    clustered_issue_count = (
        await db.execute(
            select(func.count()).select_from(Issue).where(Issue.constituency_id == constituency_id, Issue.cluster_id.is_not(None))
        )
    ).scalar_one()
    pending_issue_count = raw_issue_count - clustered_issue_count
    public_cluster_count = (
        await db.execute(
            select(func.count())
            .select_from(IssueCluster)
            .where(
                IssueCluster.constituency_id == constituency_id,
                IssueCluster.issue_count >= settings.correct_constituency_minimum_cluster_size,
            )
        )
    ).scalar_one()
    action_count = (
        await db.execute(select(func.count()).select_from(ParliamentaryAction).where(ParliamentaryAction.constituency_id == constituency_id))
    ).scalar_one()
    average_severity = (
        await db.execute(select(func.avg(Issue.severity_score)).where(Issue.constituency_id == constituency_id))
    ).scalar_one()
    latest_issue_at = (
        await db.execute(select(func.max(Issue.created_at)).where(Issue.constituency_id == constituency_id))
    ).scalar_one()

    category_rows = (
        await db.execute(
            select(func.coalesce(Issue.issue_type, "other").label("category"), func.count(Issue.id).label("count"))
            .where(Issue.constituency_id == constituency_id)
            .group_by(text("category"))
            .order_by(desc(text("count")), text("category"))
            .limit(6)
        )
    ).all()
    top_category = category_rows[0].category if category_rows else None

    recent_rows = (
        await db.execute(
            select(Issue)
            .where(Issue.constituency_id == constituency_id)
            .order_by(desc(Issue.created_at))
            .limit(5)
        )
    ).scalars().all()

    return ConstituencyDeskResponse(
        constituency_id=constituency_id,
        raw_issue_count=raw_issue_count,
        clustered_issue_count=clustered_issue_count,
        pending_issue_count=pending_issue_count,
        public_cluster_count=public_cluster_count,
        action_count=action_count,
        top_category=top_category,
        average_severity=_decimal_to_float(average_severity),
        latest_issue_at=latest_issue_at.isoformat() if latest_issue_at else None,
        category_breakdown=[
            ConstituencyCategoryCount(category=row.category, count=row.count)
            for row in category_rows
        ],
        recent_issues=[
            ConstituencyRecentIssue(
                id=str(issue.id),
                text_preview=_preview_text(issue.translated_text or issue.raw_text),
                category=issue.issue_type,
                severity=_decimal_to_float(issue.severity_score),
                created_at=issue.created_at.isoformat(),
                clustered=issue.cluster_id is not None,
            )
            for issue in recent_rows
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


async def fetch_constituency_timeline(db: AsyncSession, constituency_id: int) -> ConstituencyTimelineResponse:
    stmt = (
        select(
            func.date_trunc("week", Issue.created_at).label("week_start"),
            func.coalesce(Issue.issue_type, "other").label("category"),
            func.count(Issue.id).label("issue_count"),
            func.avg(Issue.severity_score).label("severity_avg"),
        )
        .where(Issue.constituency_id == constituency_id, Issue.created_at >= datetime.now(timezone.utc) - timedelta(days=365))
        .group_by(text("week_start"), text("category"))
        .order_by(text("week_start"), text("category"))
    )
    rows = (await db.execute(stmt)).all()
    series: dict[str, list[dict]] = {}
    for row in rows:
        category = row.category or "other"
        series.setdefault(category, []).append(
            {
                "week": row.week_start.date().isoformat(),
                "count": row.issue_count,
                "severity_avg": _decimal_to_float(row.severity_avg),
            }
        )
    return ConstituencyTimelineResponse(
        constituency_id=constituency_id,
        timeline=[{"category": category, "data": data} for category, data in sorted(series.items())],
    )


async def fetch_constituency_actions(db: AsyncSession, constituency_id: int) -> ConstituencyActionsResponse:
    stmt = (
        select(ParliamentaryAction)
        .where(
            ParliamentaryAction.constituency_id == constituency_id,
            (ParliamentaryAction.filed_at.is_not(None) | ParliamentaryAction.status.in_(("filed", "response_received"))),
        )
        .order_by(desc(ParliamentaryAction.filed_at).nullslast(), desc(ParliamentaryAction.created_at))
        .limit(50)
    )
    actions = (await db.execute(stmt)).scalars().all()
    return ConstituencyActionsResponse(
        constituency_id=constituency_id,
        actions=[
            {
                "type": action.action_type,
                "content": action.content,
                "status": action.status,
                "filed_at": action.filed_at.isoformat() if action.filed_at else None,
                "response_text": action.response_text,
            }
            for action in actions
        ],
    )


async def fetch_national_pulse(db: AsyncSession) -> NationalPulseResponse:
    threshold = settings.correct_constituency_minimum_cluster_size
    label_expr = func.coalesce(IssueCluster.label, IssueCluster.category, "Unlabelled")
    stmt = (
        select(
            label_expr.label("label"),
            func.count(func.distinct(IssueCluster.constituency_id)).label("constituency_count"),
            func.avg(IssueCluster.severity_avg).label("avg_severity"),
            func.sum(IssueCluster.issue_count).label("total_reports"),
        )
        .where(IssueCluster.issue_count >= threshold)
        .group_by(label_expr)
        .order_by(desc(text("total_reports")), desc(text("constituency_count")))
        .limit(10)
    )
    rows = (await db.execute(stmt)).all()
    return NationalPulseResponse(
        issues=[
            {
                "label": row.label,
                "constituency_count": row.constituency_count,
                "avg_severity": _decimal_to_float(row.avg_severity),
                "total_reports": row.total_reports or 0,
            }
            for row in rows
        ]
    )


async def fetch_weekly_audit(db: AsyncSession) -> WeeklyAuditResponse:
    window_start = datetime.now(timezone.utc) - timedelta(days=7)
    geographic_rows = (
        await db.execute(
            select(Constituency.region, func.count(AgentLog.id))
            .outerjoin(AgentLog, and_(AgentLog.constituency_id == Constituency.id, AgentLog.created_at >= window_start))
            .group_by(Constituency.region)
            .order_by(Constituency.region)
        )
    ).all()
    party_rows = (
        await db.execute(
            select(Constituency.mp_party, func.count(AgentLog.id))
            .outerjoin(AgentLog, and_(AgentLog.constituency_id == Constituency.id, AgentLog.created_at >= window_start))
            .group_by(Constituency.mp_party)
            .order_by(Constituency.mp_party)
        )
    ).all()
    fact_check_rows = (
        await db.execute(
            select(
                func.count(AgentLog.id).label("total_runs"),
                func.sum(case((AgentLog.error_code.is_(None), 1), else_=0)).label("successful_runs"),
            )
            .where(AgentLog.agent_type == "fact_check", AgentLog.created_at >= window_start)
        )
    ).one()

    return WeeklyAuditResponse(
        week=window_start.date().isoformat(),
        geographic_balance={row.region or "unknown": row[1] for row in geographic_rows},
        party_distribution={row.mp_party or "unknown": row[1] for row in party_rows},
        fact_check_stats={
            "total_runs": fact_check_rows.total_runs or 0,
            "successful_runs": fact_check_rows.successful_runs or 0,
        },
    )


async def fetch_debug_agents(db: AsyncSession) -> dict:
    recent_rows = (
        await db.execute(
            select(AgentLog).order_by(desc(AgentLog.created_at)).limit(500)
        )
    ).scalars().all()

    latest_by_agent: dict[str, AgentLog] = {}
    run_counts: dict[str, int] = {}
    active_constituencies: dict[str, set[int]] = {}

    for row in recent_rows:
        run_counts[row.agent_type] = run_counts.get(row.agent_type, 0) + 1
        latest_by_agent.setdefault(row.agent_type, row)
        if row.constituency_id is not None:
            active_constituencies.setdefault(row.agent_type, set()).add(row.constituency_id)

    ordered_types = ("intake", "clustering", "question_draft", "mp_brief", "distribution", "fact_check")
    return {
        "agents": [
            {
                "agent_type": agent_type,
                "last_run": latest_by_agent[agent_type].created_at.isoformat() if agent_type in latest_by_agent else None,
                "last_action": latest_by_agent[agent_type].action if agent_type in latest_by_agent else None,
                "error_code": latest_by_agent[agent_type].error_code if agent_type in latest_by_agent else None,
                "recent_runs": run_counts.get(agent_type, 0),
                "active_constituencies": sorted(active_constituencies.get(agent_type, set())),
            }
            for agent_type in ordered_types
        ]
    }


async def fetch_public_roadmap_runtime(db: AsyncSession) -> dict:
    recent_rows = (await db.execute(select(AgentLog).order_by(desc(AgentLog.created_at)).limit(500))).scalars().all()

    latest_by_agent: dict[str, AgentLog] = {}
    run_counts: dict[str, int] = {}
    active_constituencies: dict[str, set[int]] = {}

    for row in recent_rows:
        run_counts[row.agent_type] = run_counts.get(row.agent_type, 0) + 1
        latest_by_agent.setdefault(row.agent_type, row)
        if row.constituency_id is not None:
            active_constituencies.setdefault(row.agent_type, set()).add(row.constituency_id)

    ordered_types = ("intake", "clustering", "question_draft", "mp_brief", "distribution", "fact_check")
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "agents": [
            {
                "agent_type": agent_type,
                "last_run": latest_by_agent[agent_type].created_at.isoformat() if agent_type in latest_by_agent else None,
                "recent_runs": run_counts.get(agent_type, 0),
                "active_constituency_count": len(active_constituencies.get(agent_type, set())),
            }
            for agent_type in ordered_types
        ],
    }


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


@router.get("/api/constituencies", response_model=ConstituencyDirectoryResponse)
async def get_constituencies(db: AsyncSession = Depends(get_db)) -> ConstituencyDirectoryResponse:
    return await fetch_constituency_directory(db)


@router.get("/api/constituency/{id}/issues", response_model=ConstituencyIssuesResponse)
async def get_constituency_issues(
    id: int,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> ConstituencyIssuesResponse:
    return await fetch_constituency_clusters(db, id, page, per_page)


@router.get("/api/constituency/{id}/desk", response_model=ConstituencyDeskResponse)
async def get_constituency_desk(id: int, db: AsyncSession = Depends(get_db)) -> ConstituencyDeskResponse:
    return await fetch_constituency_desk(db, id)


@router.get("/api/constituency/{id}/timeline", response_model=ConstituencyTimelineResponse)
async def get_constituency_timeline(id: int, db: AsyncSession = Depends(get_db)) -> ConstituencyTimelineResponse:
    return await fetch_constituency_timeline(db, id)


@router.get("/api/constituency/{id}/actions", response_model=ConstituencyActionsResponse)
async def get_constituency_actions(id: int, db: AsyncSession = Depends(get_db)) -> ConstituencyActionsResponse:
    return await fetch_constituency_actions(db, id)


@router.get("/api/national/pulse", response_model=NationalPulseResponse)
async def get_national_pulse(db: AsyncSession = Depends(get_db)) -> NationalPulseResponse:
    return await fetch_national_pulse(db)


@router.get("/api/national/heatmap", response_model=HeatmapResponse)
async def get_national_heatmap(db: AsyncSession = Depends(get_db)) -> HeatmapResponse:
    return await fetch_national_heatmap(db)


@router.get("/api/audit/weekly", response_model=WeeklyAuditResponse)
async def get_weekly_audit(db: AsyncSession = Depends(get_db)) -> WeeklyAuditResponse:
    return await fetch_weekly_audit(db)


@router.get("/api/debug/agents")
async def get_debug_agents(db: AsyncSession = Depends(get_db)) -> dict:
    return await fetch_debug_agents(db)


@router.get("/api/roadmap/runtime")
async def get_roadmap_runtime(db: AsyncSession = Depends(get_db)) -> dict:
    return await fetch_public_roadmap_runtime(db)
