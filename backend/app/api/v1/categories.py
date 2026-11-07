from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from app.api.deps import get_current_admin
from app.utils import slugify

router = APIRouter()

@router.get("", response_model=List[CategoryOut])
def list_categories(
    include_inactive: bool = True,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    categories = query.order_by(Category.display_order.asc(), Category.name.asc()).all()

    # compute product counts
    results = []
    for cat in categories:
        count = db.query(func.count(Product.id)).filter(Product.category_id == cat.id).scalar() or 0
        cat_out = CategoryOut.model_validate(cat)
        cat_out.product_count = count
        results.append(cat_out)
    return results

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    slug = category_in.slug or slugify(category_in.name)
    existing = db.query(Category).filter((Category.name == category_in.name) | (Category.slug == slug)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name or slug already exists"
        )
    category = Category(
        name=category_in.name.strip(),
        slug=slug,
        description=category_in.description,
        image_url=category_in.image_url,
        display_order=category_in.display_order,
        is_active=category_in.is_active
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    out = CategoryOut.model_validate(category)
    out.product_count = 0
    return out

@router.get("/{category_id}", response_model=CategoryOut)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    count = db.query(func.count(Product.id)).filter(Product.category_id == category.id).scalar() or 0
    out = CategoryOut.model_validate(category)
    out.product_count = count
    return out

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if category_in.name is not None:
        category.name = category_in.name.strip()
    if category_in.slug is not None:
        category.slug = slugify(category_in.slug)
    elif category_in.name is not None and not category_in.slug:
        category.slug = slugify(category.name)
        
    if category_in.description is not None:
        category.description = category_in.description
    if category_in.image_url is not None:
        category.image_url = category_in.image_url
    if category_in.display_order is not None:
        category.display_order = category_in.display_order
    if category_in.is_active is not None:
        category.is_active = category_in.is_active

    db.commit()
    db.refresh(category)
    count = db.query(func.count(Product.id)).filter(Product.category_id == category.id).scalar() or 0
    out = CategoryOut.model_validate(category)
    out.product_count = count
    return out

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    reassign_to_id: Optional[int] = Query(None, description="Category ID to reassign products to"),
    force: bool = Query(False, description="Force delete category and cascade delete its products"),
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    count = db.query(func.count(Product.id)).filter(Product.category_id == category.id).scalar() or 0
    if count > 0:
        if reassign_to_id:
            # Check target category exists
            target_cat = db.query(Category).filter(Category.id == reassign_to_id).first()
            if not target_cat:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target reassign category does not exist")
            if target_cat.id == category.id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot reassign to the same category being deleted")
            
            # Reassign all products to target category
            db.query(Product).filter(Product.category_id == category.id).update(
                {"category_id": target_cat.id},
                synchronize_session="fetch"
            )
            db.commit()
        elif force:
            # Cascade delete products
            prods = db.query(Product).filter(Product.category_id == category.id).all()
            for p in prods:
                db.delete(p)
            db.commit()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category with {count} active products without reassigning or confirming deletion."
            )

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

