from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base, utcnow

class StoreSetting(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(150), nullable=False, default="Jershiha Fashion")
    tagline = Column(String(255), nullable=True, default="Curated Women's Fashion & Ethnic Couture")
    logo_url = Column(String(500), nullable=True)
    whatsapp_number = Column(String(50), nullable=False, default="919876543210")
    phone = Column(String(50), nullable=False, default="+91 98765 43210")
    email = Column(String(150), nullable=False, default="care@jershihafashion.com")
    address = Column(Text, nullable=False, default="Thazheveettuvilakam, Puthiyathura, Pulluvila P.O. - 695526")
    hours = Column(String(150), nullable=True, default="Mon - Sun: 10:30 AM - 9:00 PM")
    maps_embed_url = Column(Text, nullable=True, default="https://maps.google.com/maps?q=Thazheveettuvilakam%2C+Puthiyathura%2C+Pulluvila+P.O.+695526&t=&z=16&ie=UTF8&iwloc=&output=embed")
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class SystemMeta(Base):
    __tablename__ = "system_meta"

    key = Column(String(100), primary_key=True)
    value = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)


