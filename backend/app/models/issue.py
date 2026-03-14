from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    citizen_id: Mapped[UUID | None] = mapped_column(ForeignKey("citizens.id"))
    constituency_id: Mapped[int | None] = mapped_column(ForeignKey("constituencies.id"))
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    translated_text: Mapped[str | None] = mapped_column(Text)
    source_language: Mapped[str | None] = mapped_column(Text)
    source_channel: Mapped[str | None] = mapped_column(Text)
    issue_type: Mapped[str | None] = mapped_column(Text)
    severity_score: Mapped[Decimal | None] = mapped_column(Numeric(3, 1))
    urgency_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    location_district: Mapped[str | None] = mapped_column(Text)
    location_ward: Mapped[str | None] = mapped_column(Text)
    affected_estimate: Mapped[int | None] = mapped_column(Integer)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1536))
    cluster_id: Mapped[UUID | None] = mapped_column(ForeignKey("issue_clusters.id"))
    ministry_mapped: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    citizen = relationship("Citizen", back_populates="issues")
    constituency = relationship("Constituency", back_populates="issues")
    cluster = relationship("IssueCluster", back_populates="issues")
