from typing import List
from app.models.product import Product
from app.schemas.product import ProductCardOut, ProductDetailOut
from app.schemas.category import CategoryOut
from app.schemas.image import ImageOut
from app.schemas.variant import VariantOut
from app.schemas.offer import OfferOut

SIZE_RANK = {
    "FREE SIZE": 0, "FREE": 0, "ONESIZE": 0,
    "XXS": 1, "XS": 2, "S": 3, "M": 4, "L": 5, "XL": 6, "XXL": 7, "2XL": 7, "3XL": 8, "4XL": 9, "5XL": 10,
    "UNSTITCHED": 90, "SEMI-STITCHED": 91
}

def natural_size_sort_key(s: str):
    clean = s.strip().upper()
    if clean in SIZE_RANK:
        return (0, SIZE_RANK[clean], "")
    try:
        return (1, float(clean), "")
    except ValueError:
        return (2, 0, clean)

def product_to_card_out(prod: Product) -> ProductCardOut:
    raw_sizes = list({v.size for v in prod.variants if v.size})
    sizes = sorted(raw_sizes, key=natural_size_sort_key)
    colours = sorted(list({
        v.colour.strip() for v in prod.variants
        if v.colour and v.colour.strip() and v.colour.strip().lower() not in ("standard", "default", "none", "n/a", "-")
    }))
    primary_img = prod.primary_image_url
    
    images_out = [
        ImageOut.model_validate(img) for img in sorted(prod.images, key=lambda x: x.display_order)
    ]
    variants_out = [
        VariantOut.model_validate(v) for v in prod.variants
    ]

    return ProductCardOut(
        id=prod.id,
        sku=prod.sku,
        name=prod.name,
        slug=prod.slug,
        category_id=prod.category_id,
        category_name=prod.category.name if prod.category else None,
        original_price=prod.original_price,
        discounted_price=prod.discounted_price,
        discount_percentage=prod.discount_percentage or 0.0,
        effective_price=prod.effective_price,
        primary_image_url=primary_img,
        images=images_out,
        available_sizes=sizes,
        available_colours=colours,
        total_stock=prod.total_stock,
        is_featured=prod.is_featured,
        is_new_arrival=prod.is_new_arrival,
        is_on_offer=prod.is_on_offer,
        offer_label=prod.offer_label,
        is_active=prod.is_active,
        created_at=prod.created_at,
        variants=variants_out
    )

def product_to_detail_out(prod: Product) -> ProductDetailOut:
    card = product_to_card_out(prod)
    offers_out = [
        OfferOut(
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
            is_currently_valid=o.is_currently_valid,
            product_count=len(o.products)
        )
        for o in prod.offers if o.is_active
    ]

    return ProductDetailOut(
        **card.model_dump(),
        description=prod.description,
        category=CategoryOut.model_validate(prod.category) if prod.category else None,
        variants=variants_out,
        offers=offers_out,
        updated_at=prod.updated_at
    )

