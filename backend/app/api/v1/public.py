from typing import List, Optional
from datetime import datetime, timezone
import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func
from app.core.database import get_db
from app.core.config import settings
from app.models.product import Product
from app.models.category import Category
from app.models.variant import ProductVariant
from app.models.offer import Offer
from app.models.setting import StoreSetting
from app.schemas.product import ProductCardOut, ProductDetailOut, ProductListResponse
from app.schemas.category import CategoryOut
from app.schemas.offer import OfferOut
from app.schemas.setting import StoreSettingOut
from app.services.product_transformer import product_to_card_out, product_to_detail_out

router = APIRouter()

@router.get("/store-info", response_model=StoreSettingOut)
def get_store_info(db: Session = Depends(get_db)):
    setting = db.query(StoreSetting).first()
    if not setting:
        setting = StoreSetting(
            store_name=settings.STORE_NAME,
            tagline=settings.STORE_TAGLINE,
            whatsapp_number=settings.STORE_WHATSAPP_NUMBER,
            phone=settings.STORE_PHONE,
            email=settings.STORE_EMAIL,
            address=settings.STORE_ADDRESS,
            hours=settings.STORE_HOURS,
            maps_embed_url=settings.STORE_MAPS_EMBED_URL
        )
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.get("/categories", response_model=List[CategoryOut])
def list_public_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.is_active == True).order_by(
        Category.display_order.asc(),
        Category.name.asc()
    ).all()

    results = []
    for cat in categories:
        count = db.query(func.count(Product.id)).filter(
            Product.category_id == cat.id,
            Product.is_active == True
        ).scalar() or 0
        cat_out = CategoryOut.model_validate(cat)
        cat_out.product_count = count
        results.append(cat_out)
    return results

@router.get("/products", response_model=ProductListResponse)
def list_public_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=60),
    category_slug: Optional[str] = None,
    category_id: Optional[int] = None,
    sizes: Optional[str] = None, # comma-separated e.g. "S,M,XL"
    colour: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    is_on_offer: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = Query("latest"), # latest, price_asc, price_desc, discount
    in_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)

    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug, Category.is_active == True).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
        else:
            return ProductListResponse(items=[], total=0, page=page, page_size=page_size, total_pages=1)
    elif category_id:
        query = query.filter(Product.category_id == category_id)

    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_new_arrival is not None:
        query = query.filter(Product.is_new_arrival == is_new_arrival)
    if is_on_offer is not None:
        query = query.filter(Product.is_on_offer == is_on_offer)

    if min_price is not None:
        query = query.filter(
            or_(
                Product.discounted_price >= min_price,
                (Product.discounted_price.is_(None) & (Product.original_price >= min_price))
            )
        )
    if max_price is not None:
        query = query.filter(
            or_(
                (Product.discounted_price.is_not(None) & (Product.discounted_price <= max_price)),
                (Product.discounted_price.is_(None) & (Product.original_price <= max_price))
            )
        )

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    if sizes:
        size_list = [s.strip().upper() for s in sizes.split(",") if s.strip()]
        if size_list:
            query = query.join(ProductVariant).filter(
                ProductVariant.size.in_(size_list),
                ProductVariant.stock_quantity > 0
            ).distinct()

    if colour:
        colour_term = f"%{colour.strip()}%"
        query = query.join(ProductVariant).filter(
            ProductVariant.colour.ilike(colour_term),
            ProductVariant.stock_quantity > 0
        ).distinct()

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(func.coalesce(Product.discounted_price, Product.original_price)))
    elif sort_by == "price_desc":
        query = query.order_by(desc(func.coalesce(Product.discounted_price, Product.original_price)))
    elif sort_by == "discount":
        query = query.order_by(desc(Product.discount_percentage))
    else: # latest
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    items = [product_to_card_out(p) for p in products]

    if in_stock_only:
        items = [item for item in items if item.total_stock > 0]

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/products/{slug_or_id}", response_model=ProductDetailOut)
def get_public_product_detail(
    slug_or_id: str,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    if slug_or_id.isdigit():
        product = query.filter(Product.id == int(slug_or_id)).first()
    else:
        product = query.filter(Product.slug == slug_or_id).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return product_to_detail_out(product)

@router.get("/products/{slug_or_id}/related", response_model=List[ProductCardOut])
def get_related_products(
    slug_or_id: str,
    limit: int = Query(4, ge=1, le=12),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    if slug_or_id.isdigit():
        product = query.filter(Product.id == int(slug_or_id)).first()
    else:
        product = query.filter(Product.slug == slug_or_id).first()

    if not product:
        return []

    related = db.query(Product).filter(
        Product.is_active == True,
        Product.category_id == product.category_id,
        Product.id != product.id
    ).order_by(desc(Product.created_at)).limit(limit).all()

    return [product_to_card_out(p) for p in related]

@router.get("/offers", response_model=List[OfferOut])
def list_public_offers(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    # Query offers that are active and not expired
    offers = db.query(Offer).filter(
        Offer.is_active == True,
        Offer.start_date <= now,
        Offer.expiry_date >= now
    ).order_by(Offer.expiry_date.asc()).all()

    results = []
    for o in offers:
        active_prod_count = sum(1 for p in o.products if p.is_active)
        results.append(OfferOut(
            id=o.id,
            title=o.title,
            description=o.description,
            discount_percentage=o.discount_percentage,
            promo_code=o.promo_code,
            badge_text=o.badge_text,
            banner_image=o.banner_image,
            start_date=o.start_date,
            expiry_date=o.expiry_date,
            is_active=o.is_active,
            created_at=o.created_at,
            is_currently_valid=True,
            product_count=active_prod_count
        ))
    return results

@router.get("/featured-collections")
def get_featured_collections(db: Session = Depends(get_db)):
    new_arrivals = db.query(Product).filter(
        Product.is_active == True,
        Product.is_new_arrival == True
    ).order_by(desc(Product.created_at)).limit(8).all()

    featured_dresses = db.query(Product).filter(
        Product.is_active == True,
        Product.is_featured == True
    ).order_by(desc(Product.created_at)).limit(8).all()

    special_offers = db.query(Product).filter(
        Product.is_active == True,
        Product.is_on_offer == True
    ).order_by(desc(Product.discount_percentage)).limit(8).all()

    return {
        "new_arrivals": [product_to_card_out(p) for p in new_arrivals],
        "featured": [product_to_card_out(p) for p in featured_dresses],
        "special_offers": [product_to_card_out(p) for p in special_offers]
    }

