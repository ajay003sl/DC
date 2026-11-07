from typing import List
from pydantic import BaseModel

class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    primary_image_url: str
    size: str
    colour: str
    stock_quantity: int

class CategoryStat(BaseModel):
    category_id: int
    category_name: str
    product_count: int

class DashboardOverviewOut(BaseModel):
    total_products: int
    active_products: int
    inactive_products: int
    out_of_stock_products: int
    low_stock_products_count: int
    on_offer_products: int
    new_arrivals_count: int
    total_categories: int
    low_stock_items: List[LowStockProduct]
    category_stats: List[CategoryStat]

