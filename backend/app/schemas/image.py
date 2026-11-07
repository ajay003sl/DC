from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ImageBase(BaseModel):
    image_url: str
    public_id: Optional[str] = None
    alt_text: Optional[str] = None
    is_primary: bool = False
    display_order: int = 0

class ImageCreate(ImageBase):
    pass

class ImageOut(ImageBase):
    id: int
    product_id: int
    created_at: datetime

    class Config:
        from_attributes = True

