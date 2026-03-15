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
        constituency_id=502,
        name="Thiruvananthapuram",
        clusters=(
            ClusterSeed(
                label="Vizhinjam coastal road erosion",
                category="environment",
                badge="tatkal",
                issue_count=82,
                severity=Decimal("8.7"),
                velocity=Decimal("29.0"),
                ministry="Ministry of Environment, Forest and Climate Change",
                report_templates=(
                    "Sea-facing road near Vizhinjam is eroding after each tide cycle and bus movement is unsafe.",
                    "Protective wall damage has made the coastal stretch dangerous for school and fishing traffic.",
                    "Monsoon washout is cutting into the road edge and residents fear a collapse.",
                ),
            ),
            ClusterSeed(
                label="Primary health centre queue overload",
                category="health",
                badge="rising",
                issue_count=69,
                severity=Decimal("7.2"),
                velocity=Decimal("17.0"),
                ministry="Ministry of Health and Family Welfare",
                report_templates=(
                    "Government health centre queue begins before sunrise and elderly patients wait too long.",
                    "Token limit is reached before all fever and outpatient cases are seen in the ward clinic.",
                    "Staff shortage is slowing triage at the primary health centre this week.",
                ),
            ),
            ClusterSeed(
                label="Hill ward water pressure drop",
                category="water",
                badge="chronic",
                issue_count=58,
                severity=Decimal("6.8"),
                velocity=Decimal("8.0"),
                ministry="Ministry of Jal Shakti",
                report_templates=(
                    "Morning water pressure is too low in the higher wards and tanks stay half-filled.",
                    "Households in the hill-side pockets are waiting until noon for usable flow.",
                    "Low line pressure is making daily water collection unreliable in our area.",
                ),
            ),
        ),
    ),
    ConstituencySeed(
        constituency_id=477,
        name="Bengaluru South",
        clusters=(
            ClusterSeed(
                label="Tech corridor power instability",
                category="power",
                badge="tatkal",
                issue_count=78,
                severity=Decimal("8.3"),
                velocity=Decimal("24.0"),
                ministry="Ministry of Power",
                report_templates=(
                    "Repeated voltage drops are affecting hostels, apartments, and small offices in the south corridor.",
                    "Night-time transformer stress is causing lift failures in residential towers.",
                    "Power fluctuation after 9 PM is damaging routers and home-office equipment.",
                ),
            ),
            ClusterSeed(
                label="Lake belt stormwater overflow",
                category="environment",
                badge="rising",
                issue_count=65,
                severity=Decimal("7.0"),
                velocity=Decimal("21.0"),
                ministry="Ministry of Environment, Forest and Climate Change",
                report_templates=(
                    "Stormwater drain overflow is entering apartment basements after short rain spells.",
                    "Blocked drains near the lake belt are sending dirty water onto service roads.",
                    "Overflow from the feeder drain is flooding bus stops and walkways during evening rain.",
                ),
            ),
            ClusterSeed(
                label="Government school toilet repairs pending",
                category="education",
                badge="stable",
                issue_count=54,
                severity=Decimal("5.9"),
                velocity=Decimal("6.0"),
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
        constituency_id=38,
        name="Gurugram",
        clusters=(
            ClusterSeed(
                label="Peri-urban water tanker dependence",
                category="water",
                badge="tatkal",
                issue_count=81,
                severity=Decimal("8.4"),
                velocity=Decimal("31.0"),
                ministry="Ministry of Jal Shakti",
                report_templates=(
                    "Regular piped supply is failing and entire sectors are depending on expensive tanker water.",
                    "Morning water supply is not reaching upper floors and residents are queueing for tanker refill.",
                    "Pipeline pressure collapse is forcing repeated private tanker purchases in the ward cluster.",
                ),
            ),
            ClusterSeed(
                label="Village-link road safety near service lanes",
                category="road",
                badge="rising",
                issue_count=67,
                severity=Decimal("7.1"),
                velocity=Decimal("20.0"),
                ministry="Ministry of Road Transport and Highways",
                report_templates=(
                    "Broken link road near the service lane is dangerous for school vans and two-wheelers.",
                    "Potholes and missing lane marking are causing repeated accidents near the village connector road.",
                    "Rainwater is hiding deep road damage near the service road merge point.",
                ),
            ),
            ClusterSeed(
                label="Primary clinic staffing gaps",
                category="health",
                badge="stable",
                issue_count=53,
                severity=Decimal("5.8"),
                velocity=Decimal("5.0"),
                ministry="Ministry of Health and Family Welfare",
                report_templates=(
                    "Primary clinic doctor availability is inconsistent and residents are returning without consultation.",
                    "Routine diagnostics are delayed because staffing is thin at the local clinic.",
                    "Nurse and lab support gaps are extending wait times in the primary health unit.",
                ),
            ),
            ClusterSeed(
                label="Air-quality school commute alerts",
                category="environment",
                badge="chronic",
                issue_count=51,
                severity=Decimal("5.9"),
                velocity=Decimal("7.0"),
                ministry="Ministry of Environment, Forest and Climate Change",
                report_templates=(
                    "Parents are reporting repeated poor-air mornings during the school commute corridor.",
                    "Children with asthma are facing difficult commute conditions along high-traffic stretches.",
                    "Residents want a cleaner buffer near school routes because dust and smoke stay trapped.",
                ),
            ),
        ),
    ),
)

LEGACY_DEMO_CONSTITUENCY_IDS = (148, 476, 506)


async def reset_constituency_demo_data() -> None:
    constituency_ids = sorted({*(item.constituency_id for item in SEED_DATA), *LEGACY_DEMO_CONSTITUENCY_IDS})
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
