"""Add ip_hash and submitted_at_bucket to issues for anonymous submission deduplication.

Revision ID: 20260515_0022
Revises: 20260510_0021
Create Date: 2026-05-15

Design note — why not a partial index with now():
  Postgres requires partial index predicates to use only immutable expressions.
  now() / CURRENT_TIMESTAMP are *stable* (constant within a transaction, but
  can change between transactions), so Postgres rejects them in index predicates
  with "ERROR: functions in index predicate must be marked IMMUTABLE".

  The correct approach is a stored generated column that materialises the
  6-hour bucket from created_at using only immutable arithmetic, then a
  standard unique index over that bucket column.  Old rows fall into old
  buckets, so the index naturally expires duplicates without any cleanup job.
"""

import sqlalchemy as sa
from alembic import op

revision = "20260515_0022"
down_revision = "20260510_0021"
branch_labels = None
depends_on = None

# 21600 = 6 * 3600 seconds per 6-hour bucket.
# The expression is immutable: extract(epoch from <stored column>) is
# immutable, floor() is immutable, to_timestamp() is immutable.
_BUCKET_EXPR = (
    "to_timestamp(floor(extract(epoch from created_at) / 21600.0) * 21600)"
)


def upgrade() -> None:
    op.add_column("issues", sa.Column("ip_hash", sa.String(64), nullable=True))
    op.add_column(
        "issues",
        sa.Column(
            "submitted_at_bucket",
            sa.DateTime(timezone=True),
            sa.Computed(_BUCKET_EXPR, persisted=True),
            nullable=True,
        ),
    )
    # Partial unique index: only applies to anonymous rows (ip_hash IS NOT NULL).
    # COALESCE(issue_type, '') treats unclassified submissions as a single
    # bucket key so back-to-back anonymous submissions with no category_hint
    # are still deduplicated correctly.
    op.execute(
        """
        CREATE UNIQUE INDEX uix_issues_anon_dedup
            ON issues (ip_hash, constituency_id, COALESCE(issue_type, ''), submitted_at_bucket)
         WHERE ip_hash IS NOT NULL
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uix_issues_anon_dedup")
    op.drop_column("issues", "submitted_at_bucket")
    op.drop_column("issues", "ip_hash")
