from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

product_offers = Table(
    "product_offers",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
    Column("offer_id", Integer, ForeignKey("offers.id", ondelete="CASCADE"), primary_key=True),
)

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    discount_percentage = Column(Float, nullable=False, default=0.0)
    promo_code = Column(String(50), nullable=True)
    badge_text = Column(String(50), default="SPECIAL OFFER", nullable=False)
    banner_image = Column(String(500), nullable=True)
    start_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    products = relationship("Product", secondary=product_offers, back_populates="offers")

    @property
    def is_currently_valid(self) -> bool:
        now = datetime.now(timezone.utc)
        start = self.start_date.replace(tzinfo=timezone.utc) if self.start_date.tzinfo is None else self.start_date
        expiry = self.expiry_date.replace(tzinfo=timezone.utc) if self.expiry_date.tzinfo is None else self.expiry_date
        return self.is_active and (start <= now <= expiry)

