from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base, utcnow

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    size = Column(String(50), nullable=False) # e.g., XS, S, M, L, XL, XXL, Free Size
    colour = Column(String(100), nullable=False) # e.g., Blush Pink, Ivory, Wine Red
    colour_hex = Column(String(20), default="#FFFFFF", nullable=False) # e.g. #FFC0CB
    stock_quantity = Column(Integer, default=0, nullable=False)
    sku_suffix = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    product = relationship("Product", back_populates="variants")

    __table_args__ = (
        UniqueConstraint("product_id", "size", "colour", name="uq_product_size_colour"),
    )

