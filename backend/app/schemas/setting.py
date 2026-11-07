from typing import Optional
from pydantic import BaseModel, Field

class StoreSettingOut(BaseModel):
    store_name: str
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    whatsapp_number: str
    phone: str
    email: str
    address: str
    hours: Optional[str] = None
    maps_embed_url: Optional[str] = None

    class Config:
        from_attributes = True

class StoreSettingUpdate(BaseModel):
    store_name: Optional[str] = None
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[str] = None
    maps_embed_url: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)

