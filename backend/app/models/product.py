from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base, utcnow
from app.models.offer import product_offers

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(300), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    
    original_price = Column(Float, nullable=False, default=0.0)
    discounted_price = Column(Float, nullable=True)
    discount_percentage = Column(Float, nullable=False, default=0.0)

    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    is_new_arrival = Column(Boolean, default=True, nullable=False, index=True)
    is_on_offer = Column(Boolean, default=False, nullable=False, index=True)
    offer_label = Column(String(100), nullable=True) # e.g. "SALE", "20% OFF", "NEW ARRIVAL"
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    offers = relationship("Offer", secondary=product_offers, back_populates="products")

    @property
    def total_stock(self) -> int:
        return sum(v.stock_quantity for v in self.variants) if self.variants else 0

    @property
    def primary_image_url(self) -> str:
        if self.images:
            for img in self.images:
                if img.is_primary:
                    return img.image_url
            return self.images[0].image_url
        return ""

    @property
    def effective_price(self) -> float:
        if self.discounted_price is not None and self.discounted_price > 0:
            return self.discounted_price
        return self.original_price

