from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class VariantBase(BaseModel):
    size: str
    colour: str
    colour_hex: str = "#FFFFFF"
    stock_quantity: int = 0
    sku_suffix: Optional[str] = None

class VariantCreate(VariantBase):
    pass

class VariantUpdate(BaseModel):
    id: Optional[int] = None
    size: Optional[str] = None
    colour: Optional[str] = None
    colour_hex: Optional[str] = None
    stock_quantity: Optional[int] = None
    sku_suffix: Optional[str] = None

class VariantOut(VariantBase):
    id: int
    product_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

