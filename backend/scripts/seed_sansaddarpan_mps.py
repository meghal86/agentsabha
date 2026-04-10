"""
Seed script: 6 AgentSabha MP personalities with parties, constituencies, welfare metrics,
and participation scores.

Usage:
    cd backend && .venv/bin/python -m scripts.seed_sansaddarpan_mps

Idempotent — checks by full_name_en before inserting.
"""
from __future__ import annotations

import asyncio
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models.party import Party
from app.models.constituency import Constituency
from app.models.mp_identity import MpIdentity, MpParticipationScore
from app.models.sansaddarpan import ConstituencyWelfareProfile, ConstituencyWelfareMetric


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

PARTIES = [
    {"name": "Samajwadi Party", "abbr": "SP", "color": "#DC2626"},
    {"name": "Bharat Rashtra Samithi", "abbr": "BRS", "color": "#E97316"},
    {"name": "All India Trinamool Congress", "abbr": "AITC", "color": "#059669"},
    {"name": "Bharatiya Janata Party", "abbr": "BJP", "color": "#F97316"},
    {"name": "Nationalist Congress Party", "abbr": "NCP", "color": "#7C3AED"},
    {"name": "Indian National Congress", "abbr": "INC", "color": "#1D4ED8"},
]

MP_SEEDS = [
    {
        "full_name_en": "Dinesh Yadav",
        "full_name_hi": "दिनेश यादव",
        "constituency_name": "Gorakhpur",
        "constituency_state": "Uttar Pradesh",
        "constituency_id_hint": 301,
        "party_abbr": "SP",
        "term_start": date(2014, 5, 16),
        "lok_sabha_no": 17,
        "participation": {
            "attendance_rate": 98.0,
            "questions_asked": 46,   # starred 12 + unstarred 34
            "debates_participated": 6,
            "zero_hour_mentions": 8,
            "private_member_bills": 0,
            "participation_score": 79,
            "national_rank": 112,
        },
        "welfare": {
            "top_gap": "MGNREGS wage delays in Gorakhpur are among the worst in Uttar Pradesh with ₹14.2 Cr pending and an average delay of 38 days.",
            "metrics": [
                {"key": "mgnregs_pending", "label": "MGNREGS pending wages", "value": "₹14.2 Cr", "benchmark": "India avg ₹4.8 Cr", "status": "alert"},
                {"key": "mgnregs_delay", "label": "MGNREGS average delay", "value": "38 days", "benchmark": "India avg 11 days", "status": "alert"},
                {"key": "pmay_completion", "label": "PMAY completion", "value": "61%", "benchmark": "India avg 82%", "status": "alert"},
                {"key": "sdg_overall", "label": "SDG composite score", "value": "52/100", "benchmark": "India avg 66/100", "status": "alert"},
                {"key": "sdg_health", "label": "SDG health score", "value": "54/100", "benchmark": "India avg 65/100", "status": "alert"},
                {"key": "sdg_education", "label": "SDG education score", "value": "48/100", "benchmark": "India avg 62/100", "status": "alert"},
                {"key": "sdg_water", "label": "SDG water score", "value": "41/100", "benchmark": "India avg 58/100", "status": "alert"},
            ],
        },
    },
    {
        "full_name_en": "Dr. Kavitha Reddy",
        "full_name_hi": "डॉ. कविता रेड्डी",
        "constituency_name": "Hyderabad",
        "constituency_state": "Telangana",
        "constituency_id_hint": 302,
        "party_abbr": "BRS",
        "term_start": date(2019, 5, 23),
        "lok_sabha_no": 17,
        "participation": {
            "attendance_rate": 95.0,
            "questions_asked": 59,   # starred 18 + unstarred 41
            "debates_participated": 11,
            "zero_hour_mentions": 3,
            "private_member_bills": 0,
            "participation_score": 88,
            "national_rank": 34,
        },
        "welfare": {
            "top_gap": "Hyderabad welfare delivery is above average but urban employment follow-through lags behind state targets.",
            "metrics": [
                {"key": "mgnregs_pending", "label": "MGNREGS pending wages", "value": "₹2.1 Cr", "benchmark": "India avg ₹4.8 Cr", "status": "positive"},
                {"key": "mgnregs_delay", "label": "MGNREGS average delay", "value": "8 days", "benchmark": "India avg 11 days", "status": "positive"},
                {"key": "pmay_completion", "label": "PMAY completion", "value": "84%", "benchmark": "India avg 82%", "status": "positive"},
                {"key": "sdg_overall", "label": "SDG composite score", "value": "71/100", "benchmark": "India avg 66/100", "status": "positive"},
                {"key": "sdg_health", "label": "SDG health score", "value": "74/100", "benchmark": "India avg 65/100", "status": "positive"},
                {"key": "sdg_education", "label": "SDG education score", "value": "69/100", "benchmark": "India avg 62/100", "status": "positive"},
                {"key": "sdg_water", "label": "SDG water score", "value": "68/100", "benchmark": "India avg 58/100", "status": "positive"},
            ],
        },
    },
    {
        "full_name_en": "Fatima Begum",
        "full_name_hi": "फ़ातिमा बेगम",
        "constituency_name": "Murshidabad",
        "constituency_state": "West Bengal",
        "constituency_id_hint": 303,
        "party_abbr": "AITC",
        "term_start": date(2019, 5, 23),
        "lok_sabha_no": 17,
        "participation": {
            "attendance_rate": 91.0,
            "questions_asked": 42,   # starred 14 + unstarred 28
            "debates_participated": 9,
            "zero_hour_mentions": 6,
            "private_member_bills": 0,
            "participation_score": 82,
            "national_rank": 68,
        },
        "welfare": {
            "top_gap": "MGNREGS wage delays in Murshidabad reach 22 days with ₹9.4 Cr pending, affecting rural livelihood security.",
            "metrics": [
                {"key": "mgnregs_pending", "label": "MGNREGS pending wages", "value": "₹9.4 Cr", "benchmark": "India avg ₹4.8 Cr", "status": "alert"},
                {"key": "mgnregs_delay", "label": "MGNREGS average delay", "value": "22 days", "benchmark": "India avg 11 days", "status": "alert"},
                {"key": "pmay_completion", "label": "PMAY completion", "value": "71%", "benchmark": "India avg 82%", "status": "pending"},
                {"key": "sdg_overall", "label": "SDG composite score", "value": "58/100", "benchmark": "India avg 66/100", "status": "pending"},
                {"key": "sdg_health", "label": "SDG health score", "value": "61/100", "benchmark": "India avg 65/100", "status": "pending"},
                {"key": "sdg_education", "label": "SDG education score", "value": "55/100", "benchmark": "India avg 62/100", "status": "pending"},
                {"key": "sdg_water", "label": "SDG water score", "value": "52/100", "benchmark": "India avg 58/100", "status": "pending"},
            ],
        },
    },
    {
        "full_name_en": "Ranjit Oraon",
        "full_name_hi": "रंजीत ओराँव",
        "constituency_name": "Khunti",
        "constituency_state": "Jharkhand",
        "constituency_id_hint": 304,
        "party_abbr": "BJP",
        "term_start": date(2019, 5, 23),
        "lok_sabha_no": 17,
        "participation": {
            "attendance_rate": 89.0,
            "questions_asked": 18,   # starred 6 + unstarred 12
            "debates_participated": 4,
            "zero_hour_mentions": 2,
            "private_member_bills": 0,
            "participation_score": 74,
            "national_rank": 145,
        },
        "welfare": {
            "top_gap": "Khunti shows severe welfare deficits across MGNREGS, PMAY, and SDG indicators with 31-day wage delays and ₹6.8 Cr pending.",
            "metrics": [
                {"key": "mgnregs_pending", "label": "MGNREGS pending wages", "value": "₹6.8 Cr", "benchmark": "India avg ₹4.8 Cr", "status": "alert"},
                {"key": "mgnregs_delay", "label": "MGNREGS average delay", "value": "31 days", "benchmark": "India avg 11 days", "status": "alert"},
                {"key": "pmay_completion", "label": "PMAY completion", "value": "54%", "benchmark": "India avg 82%", "status": "alert"},
                {"key": "sdg_overall", "label": "SDG composite score", "value": "48/100", "benchmark": "India avg 66/100", "status": "alert"},
                {"key": "sdg_health", "label": "SDG health score", "value": "51/100", "benchmark": "India avg 65/100", "status": "alert"},
                {"key": "sdg_education", "label": "SDG education score", "value": "44/100", "benchmark": "India avg 62/100", "status": "alert"},
                {"key": "sdg_water", "label": "SDG water score", "value": "39/100", "benchmark": "India avg 58/100", "status": "alert"},
            ],
        },
    },
    {
        "full_name_en": "Arjun Pawar",
        "full_name_hi": "अर्जुन पवार",
        "constituency_name": "Pune",
        "constituency_state": "Maharashtra",
        "constituency_id_hint": 305,
        "party_abbr": "NCP",
        "term_start": date(2024, 6, 3),
        "lok_sabha_no": 18,
        "participation": {
            "attendance_rate": 97.0,
            "questions_asked": 83,   # starred 22 + unstarred 61
            "debates_participated": 8,
            "zero_hour_mentions": 4,
            "private_member_bills": 0,
            "participation_score": 91,
            "national_rank": 18,
        },
        "welfare": {
            "top_gap": "Pune welfare delivery is above average across most indicators. Focus is on sustaining high performance.",
            "metrics": [
                {"key": "mgnregs_pending", "label": "MGNREGS pending wages", "value": "₹1.2 Cr", "benchmark": "India avg ₹4.8 Cr", "status": "positive"},
                {"key": "mgnregs_delay", "label": "MGNREGS average delay", "value": "5 days", "benchmark": "India avg 11 days", "status": "positive"},
                {"key": "pmay_completion", "label": "PMAY completion", "value": "88%", "benchmark": "India avg 82%", "status": "positive"},
                {"key": "sdg_overall", "label": "SDG composite score", "value": "76/100", "benchmark": "India avg 66/100", "status": "positive"},
                {"key": "sdg_health", "label": "SDG health score", "value": "78/100", "benchmark": "India avg 65/100", "status": "positive"},
                {"key": "sdg_education", "label": "SDG education score", "value": "74/100", "benchmark": "India avg 62/100", "status": "positive"},
                {"key": "sdg_water", "label": "SDG water score", "value": "72/100", "benchmark": "India avg 58/100", "status": "positive"},
            ],
        },
    },
    {
        "full_name_en": "Surender Singh Thakur",
        "full_name_hi": "सुरेंदर सिंह ठाकुर",
        "constituency_name": "Shimla",
        "constituency_state": "Himachal Pradesh",
        "constituency_id_hint": 306,
        "party_abbr": "BJP",
        "term_start": date(2009, 5, 18),
        "lok_sabha_no": 15,
        "participation": {
            "attendance_rate": 94.0,
            "questions_asked": 28,   # starred 9 + unstarred 19
            "debates_participated": 7,
            "zero_hour_mentions": 5,
            "private_member_bills": 0,
            "participation_score": 77,
            "national_rank": 98,
        },
        "welfare": {
            "top_gap": "Shimla shows moderate welfare gaps with MGNREGS delay at 14 days and PMAY completion below national average.",
            "metrics": [
                {"key": "mgnregs_pending", "label": "MGNREGS pending wages", "value": "₹3.1 Cr", "benchmark": "India avg ₹4.8 Cr", "status": "pending"},
                {"key": "mgnregs_delay", "label": "MGNREGS average delay", "value": "14 days", "benchmark": "India avg 11 days", "status": "pending"},
                {"key": "pmay_completion", "label": "PMAY completion", "value": "79%", "benchmark": "India avg 82%", "status": "pending"},
                {"key": "sdg_overall", "label": "SDG composite score", "value": "67/100", "benchmark": "India avg 66/100", "status": "positive"},
                {"key": "sdg_health", "label": "SDG health score", "value": "70/100", "benchmark": "India avg 65/100", "status": "positive"},
                {"key": "sdg_education", "label": "SDG education score", "value": "65/100", "benchmark": "India avg 62/100", "status": "positive"},
                {"key": "sdg_water", "label": "SDG water score", "value": "63/100", "benchmark": "India avg 58/100", "status": "positive"},
            ],
        },
    },
]


def _slugify(name: str) -> str:
    return name.lower().replace(" ", "-").replace(".", "").replace(",", "")


async def _ensure_party(db: AsyncSession, party_data: dict) -> Party:
    result = await db.execute(select(Party).where(Party.abbr == party_data["abbr"]))
    party = result.scalar_one_or_none()
    if party:
        print(f"  Party already exists: {party_data['abbr']}")
        return party
    party = Party(**party_data)
    db.add(party)
    await db.flush()
    print(f"  Inserted party: {party_data['abbr']}")
    return party


async def _ensure_constituency(db: AsyncSession, name: str, state: str, cid: int) -> Constituency:
    # Try by name + state first (may already exist under a different ID)
    result = await db.execute(
        select(Constituency).where(Constituency.name == name, Constituency.state == state)
    )
    constituency = result.scalar_one_or_none()
    if constituency:
        print(f"  Constituency already exists: {name} (id={constituency.id})")
        return constituency

    # Try by hint ID
    result = await db.execute(select(Constituency).where(Constituency.id == cid))
    constituency = result.scalar_one_or_none()
    if constituency:
        print(f"  Constituency ID {cid} exists (name={constituency.name}), reusing")
        return constituency

    # Create stub
    constituency = Constituency(id=cid, name=name, state=state, mp_name=None)
    db.add(constituency)
    await db.flush()
    print(f"  Inserted constituency: {name} (id={cid})")
    return constituency


async def seed(db: AsyncSession) -> dict:
    stats = {"parties_inserted": 0, "parties_existed": 0, "mps_inserted": 0, "mps_existed": 0,
             "scores_inserted": 0, "profiles_inserted": 0, "metrics_inserted": 0}

    # 1. Seed parties
    print("\n--- Seeding parties ---")
    party_map: dict[str, Party] = {}
    for pdata in PARTIES:
        before = await db.execute(select(Party).where(Party.abbr == pdata["abbr"]))
        existed = before.scalar_one_or_none() is not None
        party_map[pdata["abbr"]] = await _ensure_party(db, pdata)
        if existed:
            stats["parties_existed"] += 1
        else:
            stats["parties_inserted"] += 1

    # 2. Seed MPs
    print("\n--- Seeding MPs ---")
    for mp_data in MP_SEEDS:
        constituency = await _ensure_constituency(
            db, mp_data["constituency_name"], mp_data["constituency_state"], mp_data["constituency_id_hint"]
        )
        party = party_map[mp_data["party_abbr"]]

        # Check if MP exists
        result = await db.execute(
            select(MpIdentity).where(MpIdentity.full_name_en == mp_data["full_name_en"])
        )
        mp = result.scalar_one_or_none()

        if mp:
            print(f"  MP already exists: {mp_data['full_name_en']}")
            stats["mps_existed"] += 1
        else:
            mp = MpIdentity(
                slug=_slugify(mp_data["full_name_en"]),
                full_name_en=mp_data["full_name_en"],
                full_name_hi=mp_data.get("full_name_hi"),
                constituency_id=constituency.id,
                party_name=party.name,
                party_id=party.id,
                term_start=mp_data["term_start"],
                lok_sabha_no=mp_data["lok_sabha_no"],
            )
            db.add(mp)
            await db.flush()
            print(f"  Inserted MP: {mp_data['full_name_en']} (slug={mp.slug})")
            stats["mps_inserted"] += 1

        # Update constituency mp_name
        if constituency.mp_name != mp_data["full_name_en"]:
            constituency.mp_name = mp_data["full_name_en"]
            constituency.mp_party = party.name

        # 3. Upsert participation score
        p = mp_data["participation"]
        result = await db.execute(
            select(MpParticipationScore).where(MpParticipationScore.mp_id == mp.mp_id)
        )
        score = result.scalar_one_or_none()
        if not score:
            score = MpParticipationScore(
                mp_id=mp.mp_id,
                attendance_rate=p["attendance_rate"],
                questions_asked=p["questions_asked"],
                debates_participated=p["debates_participated"],
                zero_hour_mentions=p["zero_hour_mentions"],
                private_member_bills=p["private_member_bills"],
                participation_score=p["participation_score"],
                national_rank=p["national_rank"],
                summary=f"Budget Session 2025-26 · Score {p['participation_score']} · Rank #{p['national_rank']}",
                narrative=f"{mp_data['full_name_en']} recorded {p['attendance_rate']}% attendance with {p['questions_asked']} questions and {p['debates_participated']} debates in the Budget Session 2025-26.",
                sources=["Digital Sansad Budget Session 2025-26", "AgentSabha seed data"],
                og_ready=True,
            )
            db.add(score)
            print(f"  Inserted participation score for {mp_data['full_name_en']}: score={p['participation_score']}")
            stats["scores_inserted"] += 1
        else:
            print(f"  Participation score already exists for {mp_data['full_name_en']}")

        # 4. Upsert welfare profile + metrics
        welfare = mp_data["welfare"]
        result = await db.execute(
            select(ConstituencyWelfareProfile).where(
                ConstituencyWelfareProfile.constituency_id == constituency.id
            )
        )
        profile = result.scalar_one_or_none()
        if not profile:
            profile = ConstituencyWelfareProfile(
                constituency_id=constituency.id,
                top_gap=welfare["top_gap"],
                raised_in_parliament=False,
                refresh_cadence="Weekly seed refresh",
                source_notes=["AgentSabha seed data", "Budget Session 2025-26"],
            )
            db.add(profile)
            await db.flush()
            print(f"  Inserted welfare profile for {mp_data['constituency_name']}")
            stats["profiles_inserted"] += 1

            for idx, metric in enumerate(welfare["metrics"]):
                db.add(ConstituencyWelfareMetric(
                    profile_id=profile.id,
                    metric_key=metric["key"],
                    label=metric["label"],
                    value_text=metric["value"],
                    benchmark_text=metric["benchmark"],
                    status=metric["status"],
                    display_order=idx,
                ))
                stats["metrics_inserted"] += 1
            print(f"  Inserted {len(welfare['metrics'])} welfare metrics for {mp_data['constituency_name']}")
        else:
            print(f"  Welfare profile already exists for {mp_data['constituency_name']}")

    await db.commit()
    return stats


async def main() -> None:
    print("=" * 60)
    print("AgentSabha SansadDarpan Seed Script")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        stats = await seed(db)

    print("\n" + "=" * 60)
    print("SEED COMPLETE")
    print(f"  Parties:       {stats['parties_inserted']} inserted, {stats['parties_existed']} already existed")
    print(f"  MPs:           {stats['mps_inserted']} inserted, {stats['mps_existed']} already existed")
    print(f"  Scores:        {stats['scores_inserted']} inserted")
    print(f"  Welfare profiles: {stats['profiles_inserted']} inserted")
    print(f"  Welfare metrics:  {stats['metrics_inserted']} inserted")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
