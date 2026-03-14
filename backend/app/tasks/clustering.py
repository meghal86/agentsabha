from app.celery_app import celery_app


@celery_app.task(name="app.tasks.run_clustering")
def run_clustering() -> dict:
    return {"status": "queued"}


@celery_app.task(name="app.tasks.take_cluster_snapshot")
def take_cluster_snapshot() -> dict:
    return {"status": "queued"}

