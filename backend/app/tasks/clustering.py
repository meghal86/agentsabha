from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from sqlalchemy import desc, exists, func, select

from app.agents.clustering import ClusteringAgent
from app.celery_app import celery_app
from app.database import AsyncSessionLocal, engine
from app.models.cluster import ClusterSnapshot, IssueCluster
from app.models.issue import Issue


async def _active_constituencies() -> list[int]:
    await engine.dispose()
    async with AsyncSessionLocal() as db:
        rows = (
            await db.execute(
                select(func.distinct(Issue.constituency_id))
                .where(Issue.constituency_id.is_not(None))
                .order_by(Issue.constituency_id)
            )
        ).scalars().all()
        return [row for row in rows if row is not None]


@celery_app.task(name="app.tasks.run_clustering")
def run_clustering() -> dict:
    async def _run() -> dict:
        await engine.dispose()
        constituency_ids = await _active_constituencies()
        updated = 0
        async with AsyncSessionLocal() as db:
            agent = ClusteringAgent()
            for constituency_id in constituency_ids:
                result = await agent.run(db, constituency_id)
                updated += result["clusters_updated"]
        await engine.dispose()
        return {"status": "completed", "constituencies": len(constituency_ids), "clusters_updated": updated}

    return asyncio.run(_run())


@celery_app.task(name="app.tasks.take_cluster_snapshot")
def take_cluster_snapshot() -> dict:
    async def _run() -> dict:
        await engine.dispose()
        snapshot_date = datetime.now(timezone.utc).date()
        created = 0
        async with AsyncSessionLocal() as db:
            clusters = (await db.execute(select(IssueCluster))).scalars().all()
            for cluster in clusters:
                already_exists = await db.scalar(
                    select(exists().where(
                        ClusterSnapshot.cluster_id == cluster.id,
                        ClusterSnapshot.snapshot_date == snapshot_date,
                    ))
                )
                if already_exists:
                    continue
                db.add(
                    ClusterSnapshot(
                        cluster_id=cluster.id,
                        snapshot_date=snapshot_date,
                        issue_count=cluster.issue_count,
                        severity_avg=cluster.severity_avg,
                    )
                )
                created += 1
            await db.commit()
        await engine.dispose()
        return {"status": "completed", "snapshots_created": created}

    return asyncio.run(_run())
