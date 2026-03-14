from celery.schedules import crontab


timezone = "Asia/Kolkata"

beat_schedule = {
    "clustering-every-15-min": {
        "task": "app.tasks.run_clustering",
        "schedule": crontab(minute="*/15"),
    },
    "cluster-snapshot-weekly": {
        "task": "app.tasks.take_cluster_snapshot",
        "schedule": crontab(day_of_week="sunday", hour=0, minute=0),
    },
    "draft-questions-daily": {
        "task": "app.tasks.generate_draft_questions",
        "schedule": crontab(hour=1, minute=30),
    },
    "mp-brief-generation": {
        "task": "app.tasks.generate_mp_briefs",
        "schedule": crontab(day_of_week="friday", hour=2, minute=30),
    },
    "mp-brief-delivery": {
        "task": "app.tasks.deliver_mp_briefs",
        "schedule": crontab(day_of_week="friday", hour=3, minute=30),
    },
    "parliamentary-response-monitor": {
        "task": "app.tasks.check_parliamentary_responses",
        "schedule": crontab(hour=4, minute=30),
    },
    "weekly-audit": {
        "task": "app.tasks.run_weekly_audit",
        "schedule": crontab(day_of_week="friday", hour=14, minute=30),
    },
}

