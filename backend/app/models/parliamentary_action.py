from __future__ import annotations

from datetime import datetime
from typing import Any
from typing import Optional
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ParliamentaryAction(Base):
    __tablename__ = "parliamentary_actions"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    constituency_id: Mapped[Optional[int]] = mapped_column(ForeignKey("constituencies.id"))
    cluster_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("issue_clusters.id"))
    action_type: Mapped[Optional[str]] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_citations: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(JSONB)
    ministry: Mapped[Optional[str]] = mapped_column(Text)
    lok_sabha_rule: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="draft", nullable=False)
    mp_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    filed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    session_reference: Mapped[Optional[str]] = mapped_column(Text)
    response_text: Mapped[Optional[str]] = mapped_column(Text)
    response_received: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    constituency = relationship("Constituency", back_populates="actions")
    cluster = relationship("IssueCluster", back_populates="actions")
    dissents = relationship("DissentRecord", back_populates="action")
