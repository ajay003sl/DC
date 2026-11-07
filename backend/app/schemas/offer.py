from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class OfferBase(BaseModel):
    title: str
    description: Optional[str] = None
    discount_percentage: float = 0.0
    promo_code: Optional[str] = None
    badge_text: str = "SPECIAL OFFER"
    banner_image: Optional[str] = None
    start_date: datetime
    expiry_date: datetime
    is_active: bool = True

class OfferCreate(OfferBase):
    product_ids: Optional[List[int]] = []

class OfferUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_percentage: Optional[float] = None
    promo_code: Optional[str] = None
    badge_text: Optional[str] = None
    banner_image: Optional[str] = None
    start_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    product_ids: Optional[List[int]] = None

class OfferOut(OfferBase):
    id: int
    created_at: datetime
    is_currently_valid: bool
    product_count: Optional[int] = 0

    class Config:
        from_attributes = True

