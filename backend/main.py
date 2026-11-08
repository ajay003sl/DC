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

        # 2. Guarantee basic store settings exist
        setting = db.query(StoreSetting).first()
        if not setting:
            new_setting = StoreSetting(
                store_name="Jershiha Fashion",
                tagline="Curated Women's Fashion & Ethnic Couture",
                whatsapp_number="919876543210",
                phone="+91 98765 43210",
                email="care@jershihafashion.com",
                address="Indiranagar, Bangalore"
            )
            db.add(new_setting)
            db.commit()

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

# Mount local uploads directory for media delivery
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

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
