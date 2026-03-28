from __future__ import annotations

import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260328_0014"
down_revision = "20260314_0013"
branch_labels = None
depends_on = None


def _load_seed_rows() -> list[dict]:
    seed_path = Path(__file__).resolve().parents[2] / "app" / "data" / "sansaddarpan_mp_scores.seed.json"
    return json.loads(seed_path.read_text())


def upgrade() -> None:
    op.create_table(
        "mp_identity",
        sa.Column("mp_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("slug", sa.Text(), nullable=False, unique=True),
        sa.Column("sansad_id", sa.Text(), nullable=True),
        sa.Column("eci_id", sa.Text(), nullable=True),
        sa.Column("full_name_en", sa.Text(), nullable=False),
        sa.Column("full_name_hi", sa.Text(), nullable=True),
        sa.Column("aliases", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=True),
        sa.Column("party_name", sa.Text(), nullable=True),
        sa.Column("term_start", sa.Date(), nullable=True),
        sa.Column("term_end", sa.Date(), nullable=True),
        sa.Column("lok_sabha_no", sa.Integer(), nullable=True),
    )

    op.create_table(
        "mp_participation_scores",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("mp_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("mp_identity.mp_id"), nullable=False),
        sa.Column("attendance_rate", sa.Float(), nullable=False),
        sa.Column("questions_asked", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("debates_participated", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("zero_hour_mentions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("private_member_bills", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("voting_participation", sa.Float(), nullable=False),
        sa.Column("participation_score", sa.Integer(), nullable=False),
        sa.Column("national_rank", sa.Integer(), nullable=False),
        sa.Column("state_rank", sa.Integer(), nullable=True),
        sa.Column("party_rank", sa.Integer(), nullable=True),
        sa.Column("score_breakdown", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("narrative", sa.Text(), nullable=True),
        sa.Column("sources", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("og_ready", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )

    mp_identity = sa.table(
        "mp_identity",
        sa.column("slug", sa.Text),
        sa.column("sansad_id", sa.Text),
        sa.column("eci_id", sa.Text),
        sa.column("full_name_en", sa.Text),
        sa.column("full_name_hi", sa.Text),
        sa.column("aliases", postgresql.JSONB),
        sa.column("constituency_id", sa.Integer),
        sa.column("party_name", sa.Text),
        sa.column("lok_sabha_no", sa.Integer),
    )
    op.bulk_insert(
        mp_identity,
        [
            {
                "slug": row["slug"],
                "sansad_id": row["sansad_id"],
                "eci_id": row["eci_id"],
                "full_name_en": row["full_name_en"],
                "full_name_hi": row["full_name_hi"],
                "aliases": row["aliases"],
                "constituency_id": row["constituency_id"],
                "party_name": row["party_name"],
                "lok_sabha_no": row["lok_sabha_no"],
            }
            for row in _load_seed_rows()
        ],
    )

    bind = op.get_bind()
    insert_stmt = sa.text(
        """
        INSERT INTO mp_participation_scores (
          mp_id, attendance_rate, questions_asked, debates_participated, zero_hour_mentions,
          private_member_bills, voting_participation, participation_score, national_rank,
          state_rank, party_rank, score_breakdown, summary, narrative, sources, og_ready
        )
        SELECT
          mp.mp_id, :attendance_rate, :questions_asked, :debates_participated, :zero_hour_mentions,
          :private_member_bills, :voting_participation, :participation_score, :national_rank,
          :state_rank, :party_rank, CAST(:score_breakdown AS jsonb), :summary, :narrative, CAST(:sources AS jsonb), true
        FROM mp_identity mp
        WHERE mp.slug = :slug
        """
    )
    bind.execute(
        insert_stmt,
        [
            {
                "slug": row["slug"],
                "attendance_rate": row["attendance_rate"],
                "questions_asked": row["questions_asked"],
                "debates_participated": row["debates_participated"],
                "zero_hour_mentions": row["zero_hour_mentions"],
                "private_member_bills": row["private_member_bills"],
                "voting_participation": row["voting_participation"],
                "participation_score": row["participation_score"],
                "national_rank": row["national_rank"],
                "state_rank": row["state_rank"],
                "party_rank": row["party_rank"],
                "score_breakdown": json.dumps(row["score_breakdown"]),
                "summary": row["summary"],
                "narrative": row["narrative"],
                "sources": json.dumps(row["sources"]),
            }
            for row in _load_seed_rows()
        ],
    )


def downgrade() -> None:
    op.drop_table("mp_participation_scores")
    op.drop_table("mp_identity")
