from __future__ import annotations

from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import Date, DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MPBrief(Base):
    __tablename__ = "mp_briefs"
    __table_args__ = (UniqueConstraint("constituency_id", "week_date", name="uq_mp_brief_constituency_week"),)

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    constituency_id: Mapped[int | None] = mapped_column(ForeignKey("constituencies.id"))
    week_date: Mapped[date] = mapped_column(Date, nullable=False)
    brief_content: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    brief_pdf_url: Mapped[str | None] = mapped_column(Text)
    delivery_status: Mapped[str | None] = mapped_column(Text)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    mp_whatsapp: Mapped[str | None] = mapped_column(Text)

    constituency = relationship("Constituency", back_populates="briefs")


class PodcastEpisode(Base):
    __tablename__ = "podcast_episodes"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    week_date: Mapped[date] = mapped_column(Date, nullable=False)
    script_text: Mapped[str | None] = mapped_column(Text)
    audio_url: Mapped[str | None] = mapped_column(Text)
    video_url: Mapped[str | None] = mapped_column(Text)
    fact_check_report: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    perspective_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
