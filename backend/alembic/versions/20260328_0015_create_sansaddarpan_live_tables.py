from __future__ import annotations

import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260328_0015"
down_revision = "20260328_0014"
branch_labels = None
depends_on = None


def _load_welfare_rows() -> list[dict]:
    seed_path = Path(__file__).resolve().parents[2] / "app" / "data" / "sansaddarpan_constituency_welfare.seed.json"
    return json.loads(seed_path.read_text())


def _load_deviation_rows() -> list[dict]:
    seed_path = Path(__file__).resolve().parents[2] / "app" / "data" / "sansaddarpan_rule_deviations.seed.json"
    return json.loads(seed_path.read_text())


def upgrade() -> None:
    op.create_table(
        "constituency_welfare_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=False),
        sa.Column("top_gap", sa.Text(), nullable=False),
        sa.Column("raised_in_parliament", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("refresh_cadence", sa.Text(), nullable=False, server_default="Daily scheme refresh"),
        sa.Column("source_notes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("last_refreshed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("constituency_id", name="uq_constituency_welfare_profile"),
    )

    op.create_table(
        "constituency_welfare_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("constituency_welfare_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("metric_key", sa.Text(), nullable=False),
        sa.Column("label", sa.Text(), nullable=False),
        sa.Column("value_text", sa.Text(), nullable=False),
        sa.Column("benchmark_text", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
    )

    op.create_table(
        "rule_deviation_cases",
        sa.Column("id", sa.Text(), primary_key=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("session_label", sa.Text(), nullable=False),
        sa.Column("rule_reference", sa.Text(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("status", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("analysis", sa.Text(), nullable=False),
        sa.Column("primary_sources", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("review_notes", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("human_review_required", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    bind = op.get_bind()

    insert_profile_stmt = sa.text(
        """
        INSERT INTO constituency_welfare_profiles (
          constituency_id, top_gap, raised_in_parliament, refresh_cadence, source_notes
        )
        VALUES (
          :constituency_id, :top_gap, :raised_in_parliament, :refresh_cadence, CAST(:source_notes AS jsonb)
        )
        """
    )
    bind.execute(
        insert_profile_stmt,
        [
            {
                "constituency_id": row["constituency_id"],
                "top_gap": row["top_gap"],
                "raised_in_parliament": row["raised_in_parliament"],
                "refresh_cadence": row["refresh_cadence"],
                "source_notes": json.dumps(row.get("source_notes") or []),
            }
            for row in _load_welfare_rows()
        ],
    )

    insert_metric_stmt = sa.text(
        """
        INSERT INTO constituency_welfare_metrics (
          profile_id, metric_key, label, value_text, benchmark_text, status, display_order
        )
        SELECT
          profile.id, :metric_key, :label, :value_text, :benchmark_text, :status, :display_order
        FROM constituency_welfare_profiles profile
        WHERE profile.constituency_id = :constituency_id
        """
    )
    bind.execute(
        insert_metric_stmt,
        [
            {
                "constituency_id": row["constituency_id"],
                "metric_key": metric["metric_key"],
                "label": metric["label"],
                "value_text": metric["value_text"],
                "benchmark_text": metric["benchmark_text"],
                "status": metric["status"],
                "display_order": metric["display_order"],
            }
            for row in _load_welfare_rows()
            for metric in row["metrics"]
        ],
    )

    rule_case = sa.table(
        "rule_deviation_cases",
        sa.column("id", sa.Text),
        sa.column("title", sa.Text),
        sa.column("session_label", sa.Text),
        sa.column("rule_reference", sa.Text),
        sa.column("confidence", sa.Float),
        sa.column("status", sa.Text),
        sa.column("summary", sa.Text),
        sa.column("analysis", sa.Text),
        sa.column("primary_sources", postgresql.JSONB),
        sa.column("review_notes", postgresql.JSONB),
        sa.column("human_review_required", sa.Boolean),
    )
    op.bulk_insert(
        rule_case,
        [
            {
                "id": row["id"],
                "title": row["title"],
                "session_label": row["session_label"],
                "rule_reference": row["rule_reference"],
                "confidence": row["confidence"],
                "status": row["status"],
                "summary": row["summary"],
                "analysis": row["analysis"],
                "primary_sources": row["primary_sources"],
                "review_notes": row["review_notes"],
                "human_review_required": True,
            }
            for row in _load_deviation_rows()
        ],
    )


def downgrade() -> None:
    op.drop_table("rule_deviation_cases")
    op.drop_table("constituency_welfare_metrics")
    op.drop_table("constituency_welfare_profiles")
