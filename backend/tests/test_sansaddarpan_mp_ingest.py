from __future__ import annotations

from types import SimpleNamespace

from app.services.sansaddarpan_mp_ingest import (
    _build_aliases,
    _match_constituency,
    _normalize_constituency,
    _normalize_state,
    _slugify,
)


def test_state_normalization_handles_public_name_drift() -> None:
    assert _normalize_state("NCT of Delhi") == "delhi"
    assert _normalize_state("Orissa") == "odisha"


def test_constituency_normalization_handles_known_renames() -> None:
    assert _normalize_constituency("Bangalore South") == "bengaluru south"
    assert _normalize_constituency("Gurgaon") == "gurugram"


def test_slugify_and_alias_building_are_stable() -> None:
    assert _slugify("Shri Mani A") == "mani-a"
    assert _build_aliases("A, Shri Mani", "Shri Mani A", "A, Shri Mani") == ["A, Shri Mani", "Shri Mani A"]


def test_match_constituency_uses_normalized_keys() -> None:
    constituency = SimpleNamespace(id=477, name="Bengaluru South")
    index = {("karnataka", "bengaluru south"): constituency}

    matched = _match_constituency(index, "Bangalore South", "Karnataka")

    assert matched is constituency
