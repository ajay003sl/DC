from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.offer import Offer
from app.models.product import Product
from app.schemas.offer import OfferCreate, OfferUpdate, OfferOut
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("", response_model=List[OfferOut])
def list_offers(
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    offers = db.query(Offer).order_by(Offer.created_at.desc()).all()
    results = []
    for offer in offers:
        out = OfferOut(
            id=offer.id,
            title=offer.title,
            description=offer.description,
            discount_percentage=offer.discount_percentage,
            promo_code=offer.promo_code,
            badge_text=offer.badge_text,
            banner_image=offer.banner_image,
            start_date=offer.start_date,
            expiry_date=offer.expiry_date,
            is_active=offer.is_active,
            created_at=offer.created_at,
            is_currently_valid=offer.is_currently_valid,
            product_count=len(offer.products)
        )
        results.append(out)
    return results

@router.post("", response_model=OfferOut, status_code=status.HTTP_201_CREATED)
def create_offer(
    offer_in: OfferCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    if offer_in.expiry_date <= offer_in.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date must be after the start date"
        )

    offer = Offer(
        title=offer_in.title.strip(),
        description=offer_in.description,
        discount_percentage=offer_in.discount_percentage,
        promo_code=offer_in.promo_code.strip().upper() if offer_in.promo_code else None,
        badge_text=offer_in.badge_text or "SPECIAL OFFER",
        banner_image=offer_in.banner_image,
        start_date=offer_in.start_date,
        expiry_date=offer_in.expiry_date,
        is_active=offer_in.is_active
    )

    if offer_in.product_ids:
        products = db.query(Product).filter(Product.id.in_(offer_in.product_ids)).all()
        offer.products = products
        # optionally update products' discount and offer status
        for prod in products:
            prod.is_on_offer = True
            if not prod.offer_label:
                prod.offer_label = offer.badge_text
            if offer.discount_percentage > 0 and (not prod.discounted_price or prod.discounted_price == prod.original_price):
                prod.discount_percentage = offer.discount_percentage
                prod.discounted_price = round(prod.original_price * (1.0 - (offer.discount_percentage / 100.0)), 2)

    db.add(offer)
    db.commit()
    db.refresh(offer)

    return OfferOut(
        id=offer.id,
        title=offer.title,
        description=offer.description,
        discount_percentage=offer.discount_percentage,
        promo_code=offer.promo_code,
        badge_text=offer.badge_text,
        banner_image=offer.banner_image,
        start_date=offer.start_date,
        expiry_date=offer.expiry_date,
        is_active=offer.is_active,
        created_at=offer.created_at,
        is_currently_valid=offer.is_currently_valid,
        product_count=len(offer.products)
    )

@router.get("/{offer_id}", response_model=OfferOut)
def get_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    return OfferOut(
        id=offer.id,
        title=offer.title,
        description=offer.description,
        discount_percentage=offer.discount_percentage,
        promo_code=offer.promo_code,
        badge_text=offer.badge_text,
        banner_image=offer.banner_image,
        start_date=offer.start_date,
        expiry_date=offer.expiry_date,
        is_active=offer.is_active,
        created_at=offer.created_at,
        is_currently_valid=offer.is_currently_valid,
        product_count=len(offer.products)
    )

@router.put("/{offer_id}", response_model=OfferOut)
def update_offer(
    offer_id: int,
    offer_in: OfferUpdate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if offer_in.title is not None:
        offer.title = offer_in.title.strip()
    if offer_in.description is not None:
        offer.description = offer_in.description
    if offer_in.discount_percentage is not None:
        offer.discount_percentage = offer_in.discount_percentage
    if offer_in.promo_code is not None:
        offer.promo_code = offer_in.promo_code.strip().upper() if offer_in.promo_code else None
    if offer_in.badge_text is not None:
        offer.badge_text = offer_in.badge_text
    if offer_in.banner_image is not None:
        offer.banner_image = offer_in.banner_image
    if offer_in.start_date is not None:
        offer.start_date = offer_in.start_date
    if offer_in.expiry_date is not None:
        offer.expiry_date = offer_in.expiry_date
    if offer_in.is_active is not None:
        offer.is_active = offer_in.is_active

    if offer_in.product_ids is not None:
        products = db.query(Product).filter(Product.id.in_(offer_in.product_ids)).all()
        offer.products = products

    db.commit()
    db.refresh(offer)

    return OfferOut(
        id=offer.id,
        title=offer.title,
        description=offer.description,
        discount_percentage=offer.discount_percentage,
        promo_code=offer.promo_code,
        badge_text=offer.badge_text,
        banner_image=offer.banner_image,
        start_date=offer.start_date,
        expiry_date=offer.expiry_date,
        is_active=offer.is_active,
        created_at=offer.created_at,
        is_currently_valid=offer.is_currently_valid,
        product_count=len(offer.products)
    )

@router.delete("/{offer_id}")
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    
    db.delete(offer)
    db.commit()
    return {"message": "Offer deleted successfully"}

