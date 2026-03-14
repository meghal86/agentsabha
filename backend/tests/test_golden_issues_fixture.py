from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


def test_golden_issues_fixture_matches_prompt_distribution() -> None:
    path = Path(__file__).resolve().parent / "fixtures" / "golden_issues.json"
    issues = json.loads(path.read_text())

    assert len(issues) == 100

    source_channels = Counter(issue["source_channel"] for issue in issues)
    assert source_channels["voice_note"] == 5

    edge_cases = [issue for issue in issues if issue.get("edge_case")]
    assert len(edge_cases) == 5

    categories = Counter(issue["category"] for issue in issues if not issue.get("edge_case"))
    assert categories["road"] >= 20
    assert categories["water"] >= 20
    assert categories["health"] >= 15
    assert categories["power"] >= 15
    assert categories["education"] >= 10
    assert categories["employment"] >= 10

