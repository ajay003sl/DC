from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(150), nullable=False, default="Jershiha Fashion")
    tagline = Column(String(255), nullable=True, default="Curated Women's Fashion & Ethnic Couture")
    logo_url = Column(String(500), nullable=True)
    whatsapp_number = Column(String(50), nullable=False, default="919876543210")
    phone = Column(String(50), nullable=False, default="+91 98765 43210")
    email = Column(String(150), nullable=False, default="care@jershihafashion.com")
    address = Column(Text, nullable=False, default="Plot 42, Galleria High Street, Indiranagar, Bangalore - 560038")
    hours = Column(String(150), nullable=True, default="Mon - Sun: 10:30 AM - 9:00 PM")
    maps_embed_url = Column(Text, nullable=True, default="https://maps.google.com/maps?q=Indiranagar+Bangalore&t=&z=15&ie=UTF8&iwloc=&output=embed")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SystemMeta(Base):
    __tablename__ = "system_meta"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


