from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.category import CategoryOut
from app.schemas.image import ImageBase, ImageOut
from app.schemas.variant import VariantBase, VariantOut
from app.schemas.offer import OfferOut

class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: int
    original_price: float = Field(..., gt=0)
    discounted_price: Optional[float] = None
    discount_percentage: Optional[float] = 0.0
    is_featured: bool = False
    is_new_arrival: bool = True
    is_on_offer: bool = False
    offer_label: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    images: Optional[List[ImageBase]] = []
    variants: Optional[List[VariantBase]] = []
    offer_ids: Optional[List[int]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    original_price: Optional[float] = None
    discounted_price: Optional[float] = None
    discount_percentage: Optional[float] = None
    is_featured: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_on_offer: Optional[bool] = None
    offer_label: Optional[str] = None
    is_active: Optional[bool] = None
    images: Optional[List[ImageBase]] = None
    variants: Optional[List[VariantBase]] = None
    offer_ids: Optional[List[int]] = None

class ProductCardOut(BaseModel):
    id: int
    sku: str
    name: str
    slug: str
    category_id: int
    category_name: Optional[str] = None
    original_price: float
    discounted_price: Optional[float] = None
    discount_percentage: float
    effective_price: float
    primary_image_url: str
    images: List[ImageOut] = []
    available_sizes: List[str] = []
    available_colours: List[str] = []
    total_stock: int
    is_featured: bool
    is_new_arrival: bool
    is_on_offer: bool
    offer_label: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProductDetailOut(ProductCardOut):
    description: Optional[str] = None
    category: Optional[CategoryOut] = None
    variants: List[VariantOut] = []
    offers: List[OfferOut] = []
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductCardOut]
    total: int
    page: int
    page_size: int
    total_pages: int

