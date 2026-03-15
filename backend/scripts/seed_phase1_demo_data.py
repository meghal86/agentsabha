from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import delete, select

from app.database import AsyncSessionLocal
from app.models.agent_log import AgentLog
from app.models.cluster import ClusterSnapshot, IssueCluster
from app.models.issue import Issue
from app.models.parliamentary_action import ParliamentaryAction
from app.utils.hashing import sha256_hex


@dataclass(frozen=True)
class ClusterSeed:
    label: str
    category: str
    badge: str
    issue_count: int
    severity: Decimal
    velocity: Decimal
    ministry: str
    report_templates: tuple[str, ...]


@dataclass(frozen=True)
class ConstituencySeed:
    constituency_id: int
    name: str
    clusters: tuple[ClusterSeed, ...]


SEED_DATA = (
    ConstituencySeed(
        constituency_id=148,
        name="Varanasi",
        clusters=(
            ClusterSeed(
                label="School corridor road damage",
                category="road",
                badge="tatkal",
                issue_count=84,
                severity=Decimal("8.6"),
                velocity=Decimal("34.0"),
                ministry="Ministry of Road Transport and Highways",
                report_templates=(
                    "Road outside the government school in Ward 14 is broken and children are falling daily.",
                    "Potholes near the school gate are causing bicycle accidents every morning.",
                    "Ambulance cannot move quickly through the school road corridor after rain.",
                ),
            ),
            ClusterSeed(
                label="Peri-urban water pressure drop",
                category="water",
                badge="rising",
                issue_count=68,
                severity=Decimal("7.1"),
                velocity=Decimal("18.0"),
                ministry="Ministry of Jal Shakti",
                report_templates=(
                    "Morning water pressure falls after 5 AM in the river-side wards.",
                    "Buckets are filling only halfway because pressure is low in our mohalla.",
                    "Water line becomes dry by sunrise in the outer ward cluster.",
                ),
            ),
            ClusterSeed(
                label="Primary health centre medicine shortage",
                category="health",
                badge="chronic",
                issue_count=56,
                severity=Decimal("6.7"),
                velocity=Decimal("6.0"),
                ministry="Ministry of Health and Family Welfare",
                report_templates=(
                    "The primary health centre has no fever medicine this week.",
                    "Patients are being sent to private shops for basic tablets.",
                    "Medicine counter stays empty at the local health centre.",
                ),
            ),
        ),
    ),
    ConstituencySeed(
        constituency_id=476,
        name="Bangalore Central",
        clusters=(
            ClusterSeed(
                label="Transformer overload and nightly outages",
                category="power",
                badge="tatkal",
                issue_count=74,
                severity=Decimal("8.2"),
                velocity=Decimal("22.0"),
                ministry="Ministry of Power",
                report_templates=(
                    "Transformer overload is causing nightly outages in the central ward.",
                    "Voltage drops after 9 PM and lifts stop working in our area.",
                    "Frequent blackouts are affecting small businesses on the market road.",
                ),
            ),
            ClusterSeed(
                label="Stormwater drain overflow",
                category="environment",
                badge="rising",
                issue_count=61,
                severity=Decimal("7.0"),
                velocity=Decimal("16.0"),
                ministry="Ministry of Environment, Forest and Climate Change",
                report_templates=(
                    "Stormwater drain is overflowing onto the street after every rain.",
                    "Dirty water is collecting near the bus stop because drainage is blocked.",
                    "Overflow from the main drain is entering shopfronts in the lane.",
                ),
            ),
            ClusterSeed(
                label="Government school toilet repairs pending",
                category="education",
                badge="stable",
                issue_count=52,
                severity=Decimal("5.9"),
                velocity=Decimal("4.0"),
                ministry="Ministry of Education",
                report_templates=(
                    "School toilet repair is pending and children avoid using it.",
                    "Broken school toilet doors have not been replaced for months.",
                    "Girls' toilet remains unusable in the government school block.",
                ),
            ),
        ),
    ),
    ConstituencySeed(
        constituency_id=506,
        name="Chennai Central",
        clusters=(
            ClusterSeed(
                label="Urban flood-prone housing blocks",
                category="housing",
                badge="tatkal",
                issue_count=79,
                severity=Decimal("8.4"),
                velocity=Decimal("27.0"),
                ministry="Ministry of Housing and Urban Affairs",
                report_templates=(
                    "Water enters the ground-floor homes every time heavy rain starts.",
                    "Housing block drainage is too weak and floods within one hour.",
                    "Basement pumps are failing in the low-lying housing cluster.",
                ),
            ),
            ClusterSeed(
                label="Public hospital queue overload",
                category="health",
                badge="rising",
                issue_count=66,
                severity=Decimal("7.3"),
                velocity=Decimal("19.0"),
                ministry="Ministry of Health and Family Welfare",
                report_templates=(
                    "Queue at the government hospital begins before sunrise and moves too slowly.",
                    "Senior patients wait for hours in the outpatient line.",
                    "Token counter closes before many patients are seen in the morning.",
                ),
            ),
            ClusterSeed(
                label="Employment centre placement delays",
                category="employment",
                badge="stable",
                issue_count=54,
                severity=Decimal("5.8"),
                velocity=Decimal("5.0"),
                ministry="Ministry of Labour and Employment",
                report_templates=(
                    "Employment centre promised placement follow-up but no update came.",
                    "Youth skill centre registrations are pending for several weeks.",
                    "Applicants keep visiting the employment office without receiving status updates.",
                ),
            ),
        ),
    ),
)


async def reset_constituency_demo_data() -> None:
    constituency_ids = [item.constituency_id for item in SEED_DATA]
    async with AsyncSessionLocal() as db:
        cluster_ids = list(
            await db.scalars(select(IssueCluster.id).where(IssueCluster.constituency_id.in_(constituency_ids)))
        )
        if cluster_ids:
            await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.cluster_id.in_(cluster_ids)))
            await db.execute(delete(ClusterSnapshot).where(ClusterSnapshot.cluster_id.in_(cluster_ids)))
        await db.execute(delete(ParliamentaryAction).where(ParliamentaryAction.constituency_id.in_(constituency_ids)))
        await db.execute(delete(Issue).where(Issue.constituency_id.in_(constituency_ids)))
        await db.execute(delete(IssueCluster).where(IssueCluster.constituency_id.in_(constituency_ids)))
        await db.execute(delete(AgentLog).where(AgentLog.constituency_id.in_(constituency_ids)))
        await db.commit()


async def seed_constituency_demo_data() -> None:
    await reset_constituency_demo_data()
    rng = random.Random(20260314)

    async with AsyncSessionLocal() as db:
        for constituency in SEED_DATA:
            for cluster_index, cluster_seed in enumerate(constituency.clusters):
                first_seen = datetime.now(timezone.utc) - timedelta(days=42 - (cluster_index * 6))
                cluster = IssueCluster(
                    constituency_id=constituency.constituency_id,
                    label=cluster_seed.label,
                    category=cluster_seed.category,
                    issue_count=cluster_seed.issue_count,
                    severity_avg=cluster_seed.severity,
                    velocity=cluster_seed.velocity,
                    badge=cluster_seed.badge,
                    first_seen=first_seen,
                    last_updated=datetime.now(timezone.utc),
                    national_flag=cluster_seed.issue_count >= 60,
                )
                db.add(cluster)
                await db.flush()

                for week_offset in range(12):
                    count = max(6, cluster_seed.issue_count - (week_offset * rng.randint(2, 5)))
                    snapshot = ClusterSnapshot(
                        cluster_id=cluster.id,
                        snapshot_date=(datetime.now(timezone.utc) - timedelta(days=7 * week_offset)).date(),
                        issue_count=count,
                        severity_avg=max(Decimal("3.5"), cluster_seed.severity - Decimal(week_offset) / Decimal("10")),
                    )
                    db.add(snapshot)

                for issue_number in range(cluster_seed.issue_count):
                    created_at = datetime.now(timezone.utc) - timedelta(days=rng.randint(0, 84), hours=rng.randint(0, 23))
                    template = cluster_seed.report_templates[issue_number % len(cluster_seed.report_templates)]
                    issue = Issue(
                        constituency_id=constituency.constituency_id,
                        citizen_id=None,
                        raw_text=f"{template} [{constituency.name} report {issue_number + 1}]",
                        translated_text=template,
                        source_language="en",
                        source_channel="web",
                        issue_type=cluster_seed.category,
                        severity_score=max(Decimal("3.5"), cluster_seed.severity - Decimal(rng.randint(0, 12)) / Decimal("10")),
                        urgency_flag=cluster_seed.badge == "tatkal",
                        location_district=constituency.name,
                        location_ward=f"Ward {rng.randint(1, 24)}",
                        affected_estimate=rng.randint(20, 500),
                        embedding=None,
                        cluster_id=cluster.id,
                        ministry_mapped=cluster_seed.ministry,
                        created_at=created_at,
                    )
                    db.add(issue)

                action = ParliamentaryAction(
                    constituency_id=constituency.constituency_id,
                    cluster_id=cluster.id,
                    action_type="question_unstarred",
                    content=(
                        f"Will the Minister of {cluster_seed.ministry} be pleased to state the present action taken on "
                        f"the '{cluster_seed.label}' cluster reported from {constituency.name}?"
                    ),
                    source_citations=[
                        {
                            "title": f"{constituency.name} field dossier",
                            "url": "https://agentsabha.in/demo-citation",
                            "type": "field_report",
                            "date": datetime.now(timezone.utc).date().isoformat(),
                        }
                    ],
                    ministry=cluster_seed.ministry,
                    lok_sabha_rule="Rule 32",
                    status="filed" if cluster_index == 0 else "response_received",
                    mp_approved=True,
                    filed_at=datetime.now(timezone.utc) - timedelta(days=cluster_index + 3),
                    session_reference=f"Phase 1 Demo / {constituency.name} / {cluster_index + 1}",
                    response_text="Ministry response awaited." if cluster_index == 0 else "Matter acknowledged for follow-up review.",
                    response_received=None if cluster_index == 0 else datetime.now(timezone.utc) - timedelta(days=1),
                )
                db.add(action)

            db.add_all(
                [
                    AgentLog(
                        agent_type="intake",
                        constituency_id=constituency.constituency_id,
                        action="demo_seeded_intake",
                        input_hash=sha256_hex(constituency.name),
                        output_hash=sha256_hex(f"{constituency.name}:intake"),
                        model_version="claude-haiku-4-5",
                        tokens_used=0,
                        latency_ms=120,
                        error_code=None,
                    ),
                    AgentLog(
                        agent_type="fact_check",
                        constituency_id=constituency.constituency_id,
                        action="demo_seeded_fact_check",
                        input_hash=sha256_hex(f"{constituency.name}:fact"),
                        output_hash=sha256_hex(f"{constituency.name}:fact:ok"),
                        model_version="claude-sonnet-4-6",
                        tokens_used=0,
                        latency_ms=260,
                        error_code=None,
                    ),
                ]
            )

        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed_constituency_demo_data())
