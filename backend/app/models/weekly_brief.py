from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WeeklyBrief(Base):
    __tablename__ = "weekly_briefs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    constituency_id: Mapped[int] = mapped_column(ForeignKey("constituencies.id"), nullable=False)
    mp_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True), ForeignKey("mp_identity.mp_id"))
    brief_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    video_script_json: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    mp_whatsapp_brief: Mapped[str] = mapped_column(Text, nullable=False)
    hindi_translation: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    youtube_title: Mapped[Optional[str]] = mapped_column(Text)
    youtube_description: Mapped[Optional[str]] = mapped_column(Text)
    reel_scripts: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="draft")
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    constituency = relationship("Constituency", backref="weekly_briefs")
    mp = relationship("MpIdentity", backref="weekly_briefs")
