from __future__ import annotations

import asyncio

from app.agents.zero_hour import ZeroHourAgent
from app.celery_app import celery_app
from app.database import AsyncSessionLocal, engine


@celery_app.task(name="app.tasks.generate_zero_hour_notices")
def generate_zero_hour_notices(constituency_id: int | None = None) -> dict:
    async def _run() -> dict:
        await engine.dispose()
        async with AsyncSessionLocal() as db:
            result = await ZeroHourAgent().run(db, constituency_id)
        await engine.dispose()
        return {"status": "completed", **result}

    return asyncio.run(_run())
