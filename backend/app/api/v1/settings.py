from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings as app_settings
from app.models.setting import StoreSetting
from app.models.user import User
from app.schemas.setting import StoreSettingOut, StoreSettingUpdate
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("", response_model=StoreSettingOut)
def get_store_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    setting = db.query(StoreSetting).first()
    if not setting:
        setting = StoreSetting(
            store_name=app_settings.STORE_NAME,
            tagline=app_settings.STORE_TAGLINE,
            whatsapp_number=app_settings.STORE_WHATSAPP_NUMBER,
            phone=app_settings.STORE_PHONE,
            email=app_settings.STORE_EMAIL,
            address=app_settings.STORE_ADDRESS,
            hours=app_settings.STORE_HOURS,
            maps_embed_url=app_settings.STORE_MAPS_EMBED_URL
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.put("", response_model=StoreSettingOut)
def update_store_settings(
    update_data: StoreSettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    setting = db.query(StoreSetting).first()
    if not setting:
        setting = StoreSetting()
        db.add(setting)

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if value is not None:
            setattr(setting, field, value)

    db.commit()
    db.refresh(setting)
    return setting
