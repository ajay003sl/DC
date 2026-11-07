import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.core.config import settings
from app.api.deps import get_current_admin

router = APIRouter()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@router.post("/images", response_model=List[dict])
async def upload_images(
    files: List[UploadFile] = File(...),
    admin = Depends(get_current_admin)
):
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

    uploaded = []
    for file in files:
        # Check extension
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} has unsupported format. Allowed: {settings.ALLOWED_IMAGE_EXTENSIONS}"
            )

        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}{ext}"
        destination_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

        # Save to disk
        try:
            with open(destination_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save {file.filename}: {str(e)}")

        # Check file size
        file_size_mb = os.path.getsize(destination_path) / (1024 * 1024)
        if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
            os.remove(destination_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File {file.filename} exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit"
            )

        relative_url = f"/uploads/{saved_filename}"
        uploaded.append({
            "image_url": relative_url,
            "public_id": unique_id,
            "original_name": file.filename,
            "size_mb": round(file_size_mb, 2)
        })

    return uploaded

