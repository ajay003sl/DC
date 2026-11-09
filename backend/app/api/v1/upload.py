import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.media import UploadedMedia
from app.services.image_processor import optimize_image_to_webp

router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/images", response_model=List[dict])
async def upload_images(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

    uploaded = []
    for file in files:
        # Check extension
        ext = os.path.splitext(file.filename or "")[1].lower()
        allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"]
        if ext not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} has unsupported format. Allowed: {allowed}"
            )

        try:
            raw_bytes = await file.read()
            if len(raw_bytes) == 0:
                continue

            # Optimize and convert to WebP
            webp_bytes, content_type, width, height = optimize_image_to_webp(raw_bytes)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to process image {file.filename}: {str(e)}"
            )

        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}.webp"

        # 1. Save permanently to database (survives all Render rebuilds & restarts)
        try:
            media_item = UploadedMedia(
                id=unique_id,
                filename=saved_filename,
                content_type=content_type,
                size_bytes=len(webp_bytes),
                data=webp_bytes
            )
            db.add(media_item)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save {file.filename} to database: {str(e)}"
            )

        # 2. Also cache to local disk for fast zero-latency hits
        try:
            disk_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
            with open(disk_path, "wb") as f:
                f.write(webp_bytes)
        except Exception:
            pass # Non-fatal if disk write fails; database is source of truth

        relative_url = f"/uploads/{saved_filename}"
        uploaded.append({
            "image_url": relative_url,
            "public_id": unique_id,
            "original_name": file.filename,
            "size_mb": round(len(webp_bytes) / (1024 * 1024), 3)
        })

    return uploaded
