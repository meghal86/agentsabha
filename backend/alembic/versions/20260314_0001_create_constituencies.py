from __future__ import annotations

import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision = "20260314_0001"
down_revision = None
branch_labels = None
depends_on = None


def _load_seed_rows() -> list[dict]:
    seed_path = Path(__file__).resolve().parents[2] / "app" / "data" / "constituencies.seed.json"
    return json.loads(seed_path.read_text())


def upgrade() -> None:
    op.create_table(
        "constituencies",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("state", sa.Text(), nullable=False),
        sa.Column("region", sa.Text(), nullable=True),
        sa.Column("population", sa.Integer(), nullable=True),
        sa.Column("area_km2", sa.Numeric(), nullable=True),
        sa.Column("mp_name", sa.Text(), nullable=True),
        sa.Column("mp_party", sa.Text(), nullable=True),
        sa.Column("mp_party_govt", sa.Boolean(), nullable=True),
        sa.Column("lat", sa.Numeric(), nullable=True),
        sa.Column("lng", sa.Numeric(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )

    constituencies = sa.table(
        "constituencies",
        sa.column("id", sa.Integer),
        sa.column("name", sa.Text),
        sa.column("state", sa.Text),
        sa.column("region", sa.Text),
        sa.column("population", sa.Integer),
        sa.column("area_km2", sa.Numeric),
        sa.column("mp_name", sa.Text),
        sa.column("mp_party", sa.Text),
        sa.column("mp_party_govt", sa.Boolean),
        sa.column("lat", sa.Numeric),
        sa.column("lng", sa.Numeric),
    )
    op.bulk_insert(constituencies, _load_seed_rows())


def downgrade() -> None:
    op.drop_table("constituencies")

