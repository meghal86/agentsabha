from __future__ import annotations

from uuid import UUID

from sqlalchemy import Float, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ConstituencyDistrictCrosswalk(Base):
    __tablename__ = "constituency_district_crosswalks"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    constituency_id: Mapped[int] = mapped_column(ForeignKey("constituencies.id"), nullable=False)
    district_name: Mapped[str] = mapped_column(Text, nullable=False)
    state_name: Mapped[str] = mapped_column(Text, nullable=False)
    coverage_fraction: Mapped[float] = mapped_column(Float, nullable=False, server_default="1.0")

    constituency = relationship("Constituency", backref="district_crosswalks")
