from __future__ import annotations

from app.services.sansaddarpan_mp_participation_ingest import (
    MpParticipationSnapshot,
    _parse_attendance_date,
    _parse_session_date,
    _rank_snapshots,
)


def _snapshot(name: str, *, attendance: float, questions: int, debates: int, special: int, bills: int, state: str = "State", party: str = "Party"):
    return MpParticipationSnapshot(
        lok_sabha_no=18,
        mp_id=name,
        slug=name.lower().replace(" ", "-"),
        full_name_en=name,
        constituency_id=1,
        constituency_name="Constituency",
        state_name=state,
        party_name=party,
        sansad_id="100",
        attendance_rate=attendance,
        attendance_days_present=10,
        attendance_days_total=12,
        questions_asked=questions,
        debates_participated=debates,
        zero_hour_mentions=special,
        private_member_bills=bills,
        committee_participation=0,
        assurances_participated=0,
    )


def test_attendance_parsers_cover_both_public_formats() -> None:
    assert _parse_session_date("31/01/2025").isoformat() == "2025-01-31"
    assert _parse_attendance_date("2025-01-31 00:00:00").isoformat() == "2025-01-31"


def test_rank_snapshots_assigns_national_state_and_party_rank() -> None:
    ranked = _rank_snapshots(
        [
            _snapshot("Alpha", attendance=92.0, questions=52, debates=18, special=2, bills=1, state="Tamil Nadu", party="DMK"),
            _snapshot("Beta", attendance=80.0, questions=20, debates=8, special=0, bills=0, state="Tamil Nadu", party="DMK"),
            _snapshot("Gamma", attendance=88.0, questions=30, debates=11, special=1, bills=0, state="Kerala", party="INC"),
        ]
    )

    assert ranked[0]["snapshot"].full_name_en == "Alpha"
    assert ranked[0]["national_rank"] == 1
    assert ranked[0]["state_rank"] == 1
    beta = next(item for item in ranked if item["snapshot"].full_name_en == "Beta")
    assert beta["state_rank"] == 2
    assert ranked[0]["party_rank"] == 1
    assert beta["party_rank"] == 2
