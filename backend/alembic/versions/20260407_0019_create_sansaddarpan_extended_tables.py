"""Create extended SansadDarpan tables: parties, weekly_briefs, constituency_district_crosswalks, rule_corpus_chunks, deviation_reviews, and mp_identity.party_id FK

Revision ID: 0019_extended
Revises: 20260329_0018_expand_mp_participation_for_live_sync
Create Date: 2026-04-07
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "20260407_0019"
down_revision = "20260329_0018"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- parties ---
    op.create_table(
        "parties",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("abbr", sa.Text(), nullable=False, unique=True),
        sa.Column("color", sa.Text(), nullable=False, server_default="#666666"),
    )

    # --- constituency_district_crosswalks ---
    op.create_table(
        "constituency_district_crosswalks",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=False),
        sa.Column("district_name", sa.Text(), nullable=False),
        sa.Column("state_name", sa.Text(), nullable=False),
        sa.Column("coverage_fraction", sa.Float(), nullable=False, server_default="1.0"),
    )

    # --- weekly_briefs ---
    op.create_table(
        "weekly_briefs",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("week_number", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("constituency_id", sa.Integer(), sa.ForeignKey("constituencies.id"), nullable=False),
        sa.Column("mp_id", UUID(as_uuid=True), sa.ForeignKey("mp_identity.mp_id"), nullable=True),
        sa.Column("brief_markdown", sa.Text(), nullable=False),
        sa.Column("video_script_json", JSONB(), nullable=False),
        sa.Column("mp_whatsapp_brief", sa.Text(), nullable=False),
        sa.Column("hindi_translation", JSONB(), nullable=True),
        sa.Column("youtube_title", sa.Text(), nullable=True),
        sa.Column("youtube_description", sa.Text(), nullable=True),
        sa.Column("reel_scripts", JSONB(), nullable=True),
        sa.Column("status", sa.Text(), nullable=False, server_default="draft"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # --- rule_corpus_chunks ---
    op.create_table(
        "rule_corpus_chunks",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("source_doc", sa.Text(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("rule_ref", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # --- deviation_reviews ---
    op.create_table(
        "deviation_reviews",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("flag_id", sa.Text(), nullable=False),
        sa.Column("reviewer_name", sa.Text(), nullable=False),
        sa.Column("decision", sa.Text(), nullable=False),
        sa.Column("rationale", sa.Text(), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    # --- add party_id to mp_identity ---
    op.add_column("mp_identity", sa.Column("party_id", UUID(as_uuid=True), sa.ForeignKey("parties.id"), nullable=True))


def downgrade() -> None:
    op.drop_column("mp_identity", "party_id")
    op.drop_table("deviation_reviews")
    op.drop_table("rule_corpus_chunks")
    op.drop_table("weekly_briefs")
    op.drop_table("constituency_district_crosswalks")
    op.drop_table("parties")
