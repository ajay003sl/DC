from typing import List, Optional
import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.image import ProductImage
from app.models.variant import ProductVariant
from app.models.offer import Offer
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductCardOut, ProductDetailOut, ProductListResponse
)
from app.schemas.variant import VariantBase
from app.api.deps import get_current_admin
from app.utils import slugify, generate_sku
from app.services.product_transformer import product_to_card_out, product_to_detail_out

router = APIRouter()

@router.get("", response_model=ProductListResponse)
def list_admin_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    is_on_offer: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    sort_by: str = Query("created_desc"), # created_desc, price_asc, price_desc, name_asc
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    query = db.query(Product)

    if category_id:
        query = query.filter(Product.category_id == category_id)
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    if is_on_offer is not None:
        query = query.filter(Product.is_on_offer == is_on_offer)
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_new_arrival is not None:
        query = query.filter(Product.is_new_arrival == is_new_arrival)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    # Sorting
    if sort_by == "created_asc":
        query = query.order_by(asc(Product.created_at))
    elif sort_by == "price_asc":
        query = query.order_by(asc(Product.original_price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.original_price))
    elif sort_by == "name_asc":
        query = query.order_by(asc(Product.name))
    else:
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    items = [product_to_card_out(p) for p in products]

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.post("", response_model=ProductDetailOut, status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    # Verify category
    cat = db.query(Category).filter(Category.id == prod_in.category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")

    # Generate SKU if not provided
    sku = prod_in.sku.strip() if prod_in.sku else generate_sku(cat.name)
    existing_sku = db.query(Product).filter(Product.sku == sku).first()
    if existing_sku:
        sku = f"{sku}-{int(math.floor(math.fabs(hash(sku)))) % 1000}"

    # Generate unique slug
    base_slug = slugify(prod_in.name)
    slug = base_slug
    counter = 1
    while db.query(Product).filter(Product.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Calculate discount / prices
    original_price = float(prod_in.original_price)
    discounted_price = prod_in.discounted_price
    discount_percentage = prod_in.discount_percentage or 0.0

    if discounted_price is not None and discounted_price > 0:
        if discounted_price < original_price:
            discount_percentage = round(((original_price - discounted_price) / original_price) * 100.0, 1)
        else:
            discounted_price = None
            discount_percentage = 0.0
    elif discount_percentage > 0:
        discounted_price = round(original_price * (1.0 - (discount_percentage / 100.0)), 2)

    product = Product(
        sku=sku,
        name=prod_in.name.strip(),
        slug=slug,
        description=prod_in.description,
        category_id=prod_in.category_id,
        original_price=original_price,
        discounted_price=discounted_price,
        discount_percentage=discount_percentage,
        is_featured=prod_in.is_featured,
        is_new_arrival=prod_in.is_new_arrival,
        is_on_offer=prod_in.is_on_offer or (discount_percentage > 0),
        offer_label=prod_in.offer_label,
        is_active=prod_in.is_active
    )
    db.add(product)
    db.flush() # get product.id

    # Add images
    if prod_in.images:
        for idx, img_data in enumerate(prod_in.images):
            img = ProductImage(
                product_id=product.id,
                image_url=img_data.image_url,
                public_id=img_data.public_id,
                alt_text=img_data.alt_text or product.name,
                is_primary=img_data.is_primary if idx > 0 else True,
                display_order=img_data.display_order if img_data.display_order is not None else idx
            )
            db.add(img)

    # Add variants (stock matrix)
    if prod_in.variants:
        for v_data in prod_in.variants:
            var = ProductVariant(
                product_id=product.id,
                size=v_data.size.strip().upper(),
                colour=(v_data.colour or "").strip(),
                colour_hex=v_data.colour_hex or "#FFFFFF",
                stock_quantity=max(0, v_data.stock_quantity),
                sku_suffix=v_data.sku_suffix or f"{product.sku}-{v_data.size}"
            )
            db.add(var)

    # Attach offers if any
    if prod_in.offer_ids:
        offers = db.query(Offer).filter(Offer.id.in_(prod_in.offer_ids)).all()
        product.offers = offers

    db.commit()
    db.refresh(product)
    return product_to_detail_out(product)

@router.get("/{product_id}", response_model=ProductDetailOut)
def get_admin_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product_to_detail_out(product)

@router.put("/{product_id}", response_model=ProductDetailOut)
def update_product(
    product_id: int,
    prod_in: ProductUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if prod_in.name is not None:
        product.name = prod_in.name.strip()
    if prod_in.sku is not None:
        product.sku = prod_in.sku.strip()
    if prod_in.description is not None:
        product.description = prod_in.description
    if prod_in.category_id is not None:
        cat = db.query(Category).filter(Category.id == prod_in.category_id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category ID")
        product.category_id = prod_in.category_id

    if prod_in.original_price is not None:
        product.original_price = float(prod_in.original_price)

    # Recalculate discount
    if prod_in.discounted_price is not None or prod_in.discount_percentage is not None or prod_in.original_price is not None:
        orig = product.original_price
        disc_p = prod_in.discounted_price if prod_in.discounted_price is not None else product.discounted_price
        pct = prod_in.discount_percentage if prod_in.discount_percentage is not None else product.discount_percentage

        if disc_p is not None and disc_p > 0 and disc_p < orig:
            product.discounted_price = disc_p
            product.discount_percentage = round(((orig - disc_p) / orig) * 100.0, 1)
        elif pct is not None and pct > 0:
            product.discount_percentage = pct
            product.discounted_price = round(orig * (1.0 - (pct / 100.0)), 2)
        else:
            product.discounted_price = None
            product.discount_percentage = 0.0

    if prod_in.is_featured is not None:
        product.is_featured = prod_in.is_featured
    if prod_in.is_new_arrival is not None:
        product.is_new_arrival = prod_in.is_new_arrival
    if prod_in.is_on_offer is not None:
        product.is_on_offer = prod_in.is_on_offer
    if prod_in.offer_label is not None:
        product.offer_label = prod_in.offer_label
    if prod_in.is_active is not None:
        product.is_active = prod_in.is_active

    # Replace images if specified
    if prod_in.images is not None:
        db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
        for idx, img_data in enumerate(prod_in.images):
            img = ProductImage(
                product_id=product.id,
                image_url=img_data.image_url,
                public_id=img_data.public_id,
                alt_text=img_data.alt_text or product.name,
                is_primary=img_data.is_primary if idx > 0 else True,
                display_order=img_data.display_order if img_data.display_order is not None else idx
            )
            db.add(img)

    # Replace variants if specified
    if prod_in.variants is not None:
        db.query(ProductVariant).filter(ProductVariant.product_id == product.id).delete()
        for v_data in prod_in.variants:
            var = ProductVariant(
                product_id=product.id,
                size=v_data.size.strip().upper(),
                colour=(v_data.colour or "").strip(),
                colour_hex=v_data.colour_hex or "#FFFFFF",
                stock_quantity=max(0, v_data.stock_quantity),
                sku_suffix=v_data.sku_suffix or f"{product.sku}-{v_data.size}"
            )
            db.add(var)

    # Update offers if specified
    if prod_in.offer_ids is not None:
        offers = db.query(Offer).filter(Offer.id.in_(prod_in.offer_ids)).all()
        product.offers = offers

    db.commit()
    db.refresh(product)
    return product_to_detail_out(product)

@router.patch("/{product_id}/status")
def toggle_product_status(
    product_id: int,
    is_active: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    is_new_arrival: Optional[bool] = None,
    is_on_offer: Optional[bool] = None,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    if is_active is not None:
        product.is_active = is_active
    if is_featured is not None:
        product.is_featured = is_featured
    if is_new_arrival is not None:
        product.is_new_arrival = is_new_arrival
    if is_on_offer is not None:
        product.is_on_offer = is_on_offer

    db.commit()
    return {"message": "Status updated successfully", "is_active": product.is_active}

@router.put("/{product_id}/variants", response_model=ProductDetailOut)
def update_stock_matrix(
    product_id: int,
    variants: List[VariantBase],
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.query(ProductVariant).filter(ProductVariant.product_id == product.id).delete()
    for v_data in variants:
        var = ProductVariant(
            product_id=product.id,
            size=v_data.size.strip().upper(),
            colour=v_data.colour.strip(),
            colour_hex=v_data.colour_hex or "#FFFFFF",
            stock_quantity=max(0, v_data.stock_quantity),
            sku_suffix=v_data.sku_suffix or f"{product.sku}-{v_data.size}"
        )
        db.add(var)

    db.commit()
    db.refresh(product)
    return product_to_detail_out(product)

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}

