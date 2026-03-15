from __future__ import annotations

import asyncio

from sqlalchemy import func, select

from app.agents.question_draft import QuestionDraftAgent
from app.celery_app import celery_app
from app.database import AsyncSessionLocal, engine
from app.models.cluster import IssueCluster


@celery_app.task(name="app.tasks.generate_draft_questions")
def generate_draft_questions() -> dict:
    async def _run() -> dict:
        await engine.dispose()
        async with AsyncSessionLocal() as db:
            constituency_ids = (
                await db.execute(
                    select(func.distinct(IssueCluster.constituency_id))
                    .where(IssueCluster.constituency_id.is_not(None))
                    .order_by(IssueCluster.constituency_id)
                )
            ).scalars().all()
            agent = QuestionDraftAgent()
            created = 0
            for constituency_id in constituency_ids:
                if constituency_id is None:
                    continue
                result = await agent.run(db, constituency_id)
                created += result["drafts_created"]
        await engine.dispose()
        return {"status": "completed", "drafts_created": created}

    return asyncio.run(_run())
