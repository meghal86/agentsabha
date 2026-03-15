from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from app.agents.mp_brief import MPBriefAgent
from app.celery_app import celery_app
from app.database import AsyncSessionLocal, engine
from app.models.mp_brief import MPBrief
from app.services.whatsapp import WhatsAppService


@celery_app.task(name="app.tasks.generate_mp_briefs")
def generate_mp_briefs() -> dict:
    async def _run() -> dict:
        await engine.dispose()
        async with AsyncSessionLocal() as db:
            constituency_ids = (
                await db.execute(select(MPBrief.constituency_id).distinct().where(MPBrief.constituency_id.is_not(None)))
            ).scalars().all()
            if not constituency_ids:
                constituency_ids = [38, 477, 502]
            agent = MPBriefAgent()
            generated = 0
            for constituency_id in constituency_ids:
                result = await agent.run(db, int(constituency_id))
                generated += 1 if result.get("brief_generated") else 0
        await engine.dispose()
        return {"status": "completed", "briefs_generated": generated}

    return asyncio.run(_run())


@celery_app.task(name="app.tasks.deliver_mp_briefs")
def deliver_mp_briefs() -> dict:
    async def _run() -> dict:
        await engine.dispose()
        delivered = 0
        async with AsyncSessionLocal() as db:
            briefs = (
                await db.execute(select(MPBrief).where(MPBrief.delivery_status == "pending"))
            ).scalars().all()
            whatsapp = WhatsAppService()
            for brief in briefs:
                if not brief.mp_whatsapp or not brief.brief_pdf_url:
                    continue
                await whatsapp.send_document(
                    brief.mp_whatsapp,
                    f"AgentSabha brief for week of {brief.week_date.isoformat()}",
                    brief.brief_pdf_url,
                )
                brief.delivery_status = "sent"
                brief.delivered_at = datetime.now(timezone.utc)
                delivered += 1
            await db.commit()
        await engine.dispose()
        return {"status": "completed", "briefs_delivered": delivered}

    return asyncio.run(_run())
