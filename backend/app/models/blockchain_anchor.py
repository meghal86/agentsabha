from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import BIGINT, Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BlockchainAnchor(Base):
    __tablename__ = "blockchain_anchors"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    content_type: Mapped[Optional[str]] = mapped_column(Text)
    content_id: Mapped[Optional[UUID]] = mapped_column(PGUUID(as_uuid=True))
    content_hash: Mapped[str] = mapped_column(Text, nullable=False)
    tx_hash: Mapped[Optional[str]] = mapped_column(Text)
    block_number: Mapped[Optional[int]] = mapped_column(BIGINT)
    anchored_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    takedown_notice: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
