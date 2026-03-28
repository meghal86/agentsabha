from __future__ import annotations

import importlib.util
from pathlib import Path


def _load_module(path: Path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


def test_migration_chain_matches_prompt_order() -> None:
    versions_dir = Path(__file__).resolve().parents[1] / "alembic" / "versions"
    migration_paths = sorted(versions_dir.glob("*.py"))

    assert len(migration_paths) == 14

    modules = [_load_module(path) for path in migration_paths]
    revisions = [module.revision for module in modules]
    down_revisions = [module.down_revision for module in modules]

    assert down_revisions[0] is None
    for index in range(1, len(revisions)):
        assert down_revisions[index] == revisions[index - 1]
