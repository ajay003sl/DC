from sqlalchemy import Column, String, DateTime, LargeBinary, Integer
from app.core.database import Base, utcnow

class UploadedMedia(Base):
    __tablename__ = "uploaded_media"

    id = Column(String(100), primary_key=True, index=True)
    filename = Column(String(255), nullable=False, unique=True, index=True)
    content_type = Column(String(50), nullable=False, default="image/webp")
    size_bytes = Column(Integer, nullable=False, default=0)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
