from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260328_0016"
down_revision = "20260328_0015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sansaddarpan_source_snapshots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("source_key", sa.Text(), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=False),
        sa.Column("snapshot_kind", sa.Text(), nullable=False),
        sa.Column("fetch_status", sa.Text(), nullable=False),
        sa.Column("http_status", sa.Integer(), nullable=True),
        sa.Column("content_type", sa.Text(), nullable=True),
        sa.Column("sha256", sa.Text(), nullable=True),
        sa.Column("storage_path", sa.Text(), nullable=True),
        sa.Column("snapshot_meta", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_sansaddarpan_source_snapshots_source_key", "sansaddarpan_source_snapshots", ["source_key"])
    op.create_index("ix_sansaddarpan_source_snapshots_captured_at", "sansaddarpan_source_snapshots", ["captured_at"])

    op.create_table(
        "sansaddarpan_ingestion_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("pipeline_key", sa.Text(), nullable=False),
        sa.Column("source_key", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("records_seen", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("records_written", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("error_text", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_sansaddarpan_ingestion_runs_pipeline_key", "sansaddarpan_ingestion_runs", ["pipeline_key"])
    op.create_index("ix_sansaddarpan_ingestion_runs_started_at", "sansaddarpan_ingestion_runs", ["started_at"])


def downgrade() -> None:
    op.drop_index("ix_sansaddarpan_ingestion_runs_started_at", table_name="sansaddarpan_ingestion_runs")
    op.drop_index("ix_sansaddarpan_ingestion_runs_pipeline_key", table_name="sansaddarpan_ingestion_runs")
    op.drop_table("sansaddarpan_ingestion_runs")

    op.drop_index("ix_sansaddarpan_source_snapshots_captured_at", table_name="sansaddarpan_source_snapshots")
    op.drop_index("ix_sansaddarpan_source_snapshots_source_key", table_name="sansaddarpan_source_snapshots")
    op.drop_table("sansaddarpan_source_snapshots")
