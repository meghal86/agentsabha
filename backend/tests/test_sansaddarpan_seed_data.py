from __future__ import annotations

import json
from pathlib import Path


def test_sansaddarpan_mp_seed_file_has_expected_rows() -> None:
    path = Path(__file__).resolve().parents[1] / "app" / "data" / "sansaddarpan_mp_scores.seed.json"
    rows = json.loads(path.read_text())

    assert len(rows) == 4
    assert {row["slug"] for row in rows} == {
        "rahul-gandhi",
        "supriya-sule",
        "kanimozhi-karunanidhi",
        "mahua-moitra",
    }
    assert all(isinstance(row["participation_score"], int) for row in rows)
    assert all(row["sources"] for row in rows)


def test_sansaddarpan_constituency_welfare_seed_file_has_expected_rows() -> None:
    path = Path(__file__).resolve().parents[1] / "app" / "data" / "sansaddarpan_constituency_welfare.seed.json"
    rows = json.loads(path.read_text())

    assert len(rows) == 4
    assert {row["constituency_id"] for row in rows} == {38, 107, 477, 502}
    assert all(row["metrics"] for row in rows)
    assert {metric["metric_key"] for row in rows for metric in row["metrics"]} >= {
        "mgnregs_delay",
        "pmay_completion",
        "pm_kisan_disbursal",
        "ujjwala_refill_continuity",
        "sdg_district_score",
    }


def test_sansaddarpan_rule_deviation_seed_file_has_expected_rows() -> None:
    path = Path(__file__).resolve().parents[1] / "app" / "data" / "sansaddarpan_rule_deviations.seed.json"
    rows = json.loads(path.read_text())

    assert len(rows) == 4
    assert {row["status"] for row in rows} == {"human-verified", "under-review", "archived"}
    assert all(row["primary_sources"] for row in rows)
    assert all(row["review_notes"] for row in rows)
