from __future__ import annotations

from app.services.sansaddarpan_source_registry import FIELD_SOURCE_PLAN, OFFICIAL_SOURCES


def test_official_sources_cover_core_domains() -> None:
    required = {
        "digital_sansad_member_portal",
        "eci_results",
        "eci_delimitation_orders",
        "mgnrega_dashboard",
        "pmay_urban_dashboard",
        "pmay_rural_dashboard",
        "lok_sabha_rules",
        "sci_judgments",
    }

    assert required.issubset(OFFICIAL_SOURCES.keys())


def test_field_plan_references_known_sources_only() -> None:
    source_keys = set(OFFICIAL_SOURCES.keys())
    assert FIELD_SOURCE_PLAN
    for item in FIELD_SOURCE_PLAN:
        assert item.live_from
        assert set(item.live_from).issubset(source_keys)


def test_field_plan_calls_out_partial_or_blocked_fields_explicitly() -> None:
    status_by_field = {f"{item.page}:{item.field}": item.status for item in FIELD_SOURCE_PLAN}

    assert status_by_field["sansaddarpan.constituencies:PM-KISAN disbursal status"] == "partial"
    assert status_by_field["sansaddarpan.constituencies:Ujjwala coverage / continuity"] == "partial"
    assert status_by_field["sansaddarpan.constituencies:SDG district score"] == "blocked"
    assert status_by_field["sansaddarpan.mps:voting_participation"] == "partial"
