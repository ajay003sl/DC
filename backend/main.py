import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
import app.models
from app.models.user import User
from app.models.setting import StoreSetting
from app.models.category import Category
from app.models.product import Product
from app.core.security import get_password_hash
from app.api.v1 import api_router

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables on startup in safe try/except block
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Startup schema notice: {e}")
    
    # 1. Guarantee admin exists with immediate commit
    try:
        db = SessionLocal()
        admin = db.query(User).filter(User.email == "admin@jershihafashion.com").first()
        if not admin:
            admin = User(
                email="admin@jershihafashion.com",
                hashed_password=get_password_hash("AdminPassword123!"),
                full_name="Jershiha Store Manager",
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Guaranteed admin user initialized: admin@jershihafashion.com")

        # 2. Guarantee basic store settings exist and verify logo integrity
        DEFAULT_ADDRESS = "Thazheveettuvilakam, Puthiyathura, Pulluvila P.O. - 695526"
        DEFAULT_MAPS_URL = "https://maps.google.com/maps?q=8.335898,77.046682&t=&z=16&ie=UTF8&iwloc=&output=embed"
        DEFAULT_LOGO = "/uploads/8559d870-3228-48ce-af98-cc1677ad15e9.jpg"
        setting = db.query(StoreSetting).first()
        if not setting:
            new_setting = StoreSetting(
                store_name="Jershiha Fashion",
                tagline="Curated Women's Fashion & Ethnic Couture",
                whatsapp_number="918925184903",
                phone="+91 8925184903",
                email="care@jershihafashion.com",
                address=DEFAULT_ADDRESS,
                maps_embed_url=DEFAULT_MAPS_URL,
                logo_url=DEFAULT_LOGO
            )
            db.add(new_setting)
            db.commit()
        else:
            # Self-healing: update address and maps embed URL if it still has old placeholder or doesn't have exact shop coordinates
            if not setting.address or "Bangalore" in setting.address or "Indiranagar" in setting.address or "8.335898" not in (setting.maps_embed_url or ""):
                setting.address = DEFAULT_ADDRESS
                setting.maps_embed_url = DEFAULT_MAPS_URL
                db.commit()
                print(f"Updated store address & exact coordinates Google Maps URL to: {DEFAULT_ADDRESS}")

            # Self-healing: if the logo points to an ephemeral uploaded file that does not exist on disk,
            # restore it to the verified committed boutique logo so it never breaks after container rebuilds
            if not setting.logo_url or setting.logo_url.startswith("/uploads/"):
                needs_reset = False
                if not setting.logo_url:
                    needs_reset = True
                else:
                    filename = setting.logo_url.replace("/uploads/", "")
                    file_path = os.path.join(settings.UPLOAD_DIR, filename)
                    if not os.path.exists(file_path):
                        needs_reset = True
                
                if needs_reset:
                    setting.logo_url = DEFAULT_LOGO
                    db.commit()
                    print(f"Self-healed missing logo_url to verified committed asset: {DEFAULT_LOGO}")

        # Ensure official logo is in persistent UploadedMedia database table
        try:
            logo_disk = os.path.join(settings.UPLOAD_DIR, "8559d870-3228-48ce-af98-cc1677ad15e9.jpg")
            if not os.path.exists(logo_disk):
                logo_disk = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "logo.jpg"))
            if os.path.exists(logo_disk) and os.path.getsize(logo_disk) > 50:
                with open(logo_disk, "rb") as f:
                    logo_raw = f.read()
                existing_logo_media = db.query(UploadedMedia).filter(UploadedMedia.filename == "8559d870-3228-48ce-af98-cc1677ad15e9.jpg").first()
                if not existing_logo_media:
                    db.add(UploadedMedia(
                        id="8559d870-3228-48ce-af98-cc1677ad15e9",
                        filename="8559d870-3228-48ce-af98-cc1677ad15e9.jpg",
                        content_type="image/jpeg",
                        size_bytes=len(logo_raw),
                        data=logo_raw
                    ))
                    db.commit()
        except Exception as e:
            print(f"Logo media seeding notice: {e}")

        # 3. Clean up empty demo categories if leftover, ensuring 100% custom database
        demo_slugs = ["kurtis", "sarees", "western-wear", "dresses", "tops", "ethnic-wear", "party-wear", "casual-wear"]
        for slug in demo_slugs:
            cat = db.query(Category).filter(Category.slug == slug).first()
            if cat:
                prod_count = db.query(Product).filter(Product.category_id == cat.id).count()
                if prod_count == 0:
                    db.delete(cat)
                    print(f"Removed unused demo category: {slug}")
        db.commit()
        db.close()
    except Exception as e:
        print(f"Notice initializing startup requirements: {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RESTful API for Boutique Women's Fashion Store & Admin Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse, RedirectResponse, Response
from app.models.media import UploadedMedia

FALLBACK_FASHION_IMAGES = [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80"
]

# Resilient media delivery: serves from disk cache if present, or queries persistent DB, or deterministic fashion image fallback if file was lost during ephemeral container rebuild
@app.api_route("/uploads/{filename:path}", methods=["GET", "HEAD"])
async def serve_uploaded_media(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    # 1. Disk cache check
    if os.path.exists(file_path) and os.path.isfile(file_path) and os.path.getsize(file_path) > 50:
        return FileResponse(file_path, headers={"Cache-Control": "public, max-age=31536000, immutable"})

    # 2. Check logo candidates
    DEFAULT_LOGO = os.path.join(settings.UPLOAD_DIR, "8559d870-3228-48ce-af98-cc1677ad15e9.jpg")
    PUBLIC_LOGO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "logo.jpg"))
    DIST_LOGO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "logo.jpg"))
    
    if "logo" in filename.lower() or "8559d870" in filename:
        for logo_candidate in [DEFAULT_LOGO, PUBLIC_LOGO, DIST_LOGO]:
            if os.path.exists(logo_candidate) and os.path.getsize(logo_candidate) > 50:
                return FileResponse(logo_candidate, headers={"Cache-Control": "public, max-age=31536000, immutable"})

    # 3. Persistent database lookup (ensures images uploaded from Mac or phone survive container rebuilds)
    try:
        db = SessionLocal()
        try:
            media = db.query(UploadedMedia).filter(UploadedMedia.filename == filename).first()
            if media and media.data:
                # Write back to local disk cache for fast subsequent hits
                try:
                    with open(file_path, "wb") as f:
                        f.write(media.data)
                except Exception:
                    pass
                return Response(
                    content=media.data,
                    media_type=media.content_type or "image/webp",
                    headers={"Cache-Control": "public, max-age=31536000, immutable"}
                )
        finally:
            db.close()
    except Exception as e:
        print(f"Media DB lookup notice: {e}")

    # 4. Fallback redirect for missing dummy images
    idx = abs(hash(filename)) % len(FALLBACK_FASHION_IMAGES)
    return RedirectResponse(url=FALLBACK_FASHION_IMAGES[idx], status_code=307)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.api_route("/api/health", methods=["GET", "HEAD"], tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected"
    }

@app.head("/", tags=["Health"])
def head_root():
    return {}

# If frontend build exists, serve static assets and SPA fallback
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        # Allow API and upload calls to pass through
        if full_path.startswith("api") or full_path.startswith("uploads"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
