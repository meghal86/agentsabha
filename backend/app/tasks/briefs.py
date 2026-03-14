from app.celery_app import celery_app


@celery_app.task(name="app.tasks.generate_mp_briefs")
def generate_mp_briefs() -> dict:
    return {"status": "queued"}


@celery_app.task(name="app.tasks.deliver_mp_briefs")
def deliver_mp_briefs() -> dict:
    return {"status": "queued"}

