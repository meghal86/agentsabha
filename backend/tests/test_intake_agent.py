from __future__ import annotations

from decimal import Decimal

import pytest

from app.agents.intake import IntakeAgent


@pytest.mark.asyncio
async def test_intake_agent_extracts_road_issue_with_urgency() -> None:
    agent = IntakeAgent()

    result = await agent.run(
        "Our road has not been fixed since 2020, 3 children injured, 500 families affected, Lalganj village, Mirzapur district.",
        {"channel": "web", "language": "en"},
    )

    assert result["issue_type"] == "road"
    assert result["urgency_flag"] is True
    assert result["ministry_mapped"] == "Ministry of Road Transport and Highways"
    assert result["affected_estimate"] == 2500
    assert result["location_district"] == "Mirzapur"
    assert "Lalganj" in (result["location_ward"] or "")
    assert result["severity_score"] >= Decimal("8.0")


@pytest.mark.asyncio
async def test_intake_agent_maps_employment_to_rural_development() -> None:
    agent = IntakeAgent()

    result = await agent.run(
        "MGNREGA wages have not been paid for 3 months and 200 workers in Ward 14 are affected.",
        {"channel": "whatsapp", "language": "en"},
    )

    assert result["issue_type"] == "employment"
    assert result["ministry_mapped"] == "Ministry of Rural Development"
    assert result["urgency_flag"] is False
    assert result["affected_estimate"] == 200
    assert result["severity_score"] >= Decimal("7.0")


@pytest.mark.asyncio
async def test_intake_agent_uses_metadata_location_when_text_is_sparse() -> None:
    agent = IntakeAgent()

    result = await agent.run(
        "There is no drinking water for two weeks.",
        {"channel": "web", "language": "en", "location": "Ward 22"},
    )

    assert result["issue_type"] == "water"
    assert result["location_ward"] == "Ward 22"
    assert result["ministry_mapped"] == "Ministry of Jal Shakti"
    assert result["issue_summary"]


@pytest.mark.asyncio
async def test_intake_agent_does_not_cross_severity_8_without_explicit_safety_risk() -> None:
    agent = IntakeAgent()

    result = await agent.run(
        "Our road has been broken for 3 years and people are complaining every day, but it has become a chronic inconvenience.",
        {"channel": "web", "language": "en"},
    )

    assert result["urgency_flag"] is False
    assert result["severity_score"] <= Decimal("7.9")
