from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.variant import ProductVariant
from app.models.offer import Offer
from app.schemas.analytics import DashboardOverviewOut, LowStockProduct, CategoryStat
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/overview", response_model=DashboardOverviewOut)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    total_products = db.query(func.count(Product.id)).scalar() or 0
    active_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0
    inactive_products = total_products - active_products

    on_offer_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True,
        Product.is_on_offer == True
    ).scalar() or 0

    new_arrivals_count = db.query(func.count(Product.id)).filter(
        Product.is_active == True,
        Product.is_new_arrival == True
    ).scalar() or 0

    total_categories = db.query(func.count(Category.id)).filter(Category.is_active == True).scalar() or 0

    # Low stock query (stock_quantity <= 3)
    low_stock_rows = db.query(ProductVariant, Product).join(Product).filter(
        Product.is_active == True,
        ProductVariant.stock_quantity <= 3
    ).order_by(ProductVariant.stock_quantity.asc()).limit(15).all()

    low_stock_items = []
    for var, prod in low_stock_rows:
        low_stock_items.append(
            LowStockProduct(
                id=prod.id,
                name=prod.name,
                sku=prod.sku,
                primary_image_url=prod.primary_image_url,
                size=var.size,
                colour=var.colour,
                stock_quantity=var.stock_quantity
            )
        )

    # Count out of stock products (total stock == 0)
    all_prods = db.query(Product).filter(Product.is_active == True).all()
    out_of_stock_count = sum(1 for p in all_prods if p.total_stock == 0)

    # Category breakdown
    category_stats = []
    categories = db.query(Category).all()
    for cat in categories:
        cnt = db.query(func.count(Product.id)).filter(Product.category_id == cat.id).scalar() or 0
        category_stats.append(CategoryStat(
            category_id=cat.id,
            category_name=cat.name,
            product_count=cnt
        ))

    return DashboardOverviewOut(
        total_products=total_products,
        active_products=active_products,
        inactive_products=inactive_products,
        out_of_stock_products=out_of_stock_count,
        low_stock_products_count=len(low_stock_items),
        on_offer_products=on_offer_products,
        new_arrivals_count=new_arrivals_count,
        total_categories=total_categories,
        low_stock_items=low_stock_items,
        category_stats=category_stats
    )

