from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.categories import router as categories_router
from app.api.v1.products import router as products_router
from app.api.v1.offers import router as offers_router
from app.api.v1.upload import router as upload_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.settings import router as settings_router
from app.api.v1.public import router as public_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Admin Authentication"])
api_router.include_router(products_router, prefix="/admin/products", tags=["Admin Products"])
api_router.include_router(categories_router, prefix="/admin/categories", tags=["Admin Categories"])
api_router.include_router(offers_router, prefix="/admin/offers", tags=["Admin Offers"])
api_router.include_router(upload_router, prefix="/admin/upload", tags=["Admin Media Upload"])
api_router.include_router(analytics_router, prefix="/admin/analytics", tags=["Admin Analytics"])
api_router.include_router(settings_router, prefix="/admin/settings", tags=["Admin Store Settings"])
api_router.include_router(public_router, prefix="/public", tags=["Public Storefront"])

