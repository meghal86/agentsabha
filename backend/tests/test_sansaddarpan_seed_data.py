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
