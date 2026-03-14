from app.celery_app import celery_app


@celery_app.task(name="app.tasks.check_parliamentary_responses")
def check_parliamentary_responses() -> dict:
    return {"status": "queued"}


@celery_app.task(name="app.tasks.send_citizen_notifications")
def send_citizen_notifications() -> dict:
    return {"status": "queued"}

