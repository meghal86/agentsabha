from __future__ import annotations

import json
from pathlib import Path


def test_constituency_seed_file_has_543_rows() -> None:
    path = Path(__file__).resolve().parents[1] / "app" / "data" / "constituencies.seed.json"
    rows = json.loads(path.read_text())

    assert len(rows) == 543
    assert rows[0]["id"] == 1
    assert rows[-1]["id"] == 543
    assert len({row["id"] for row in rows}) == 543
    assert all(row["name"] for row in rows)
    assert all(row["state"] for row in rows)

