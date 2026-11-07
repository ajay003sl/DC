import os
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.image import ProductImage
from app.models.variant import ProductVariant
from app.models.offer import Offer
from app.models.setting import StoreSetting, SystemMeta

def seed_database(force: bool = False):
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Admin User
        admin_email = "admin@auraluxe.fashion"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("AdminPassword123!"),
                full_name="Boutique Store Manager",
                role="admin",
                is_active=True
            )
            db.add(admin)
            print("Created default admin user: admin@auraluxe.fashion / AdminPassword123!")

        # Also support admin@jershihafashion.com
        jershiha_admin = db.query(User).filter(User.email == "admin@jershihafashion.com").first()
        if not jershiha_admin:
            jershiha_admin = User(
                email="admin@jershihafashion.com",
                hashed_password=get_password_hash("AdminPassword123!"),
                full_name="Jershiha Store Manager",
                role="admin",
                is_active=True
            )
            db.add(jershiha_admin)
        
        # 2. Categories
        categories_data = [
            {
                "name": "Kurtis",
                "slug": "kurtis",
                "description": "Handcrafted, embroidered and breathable daily & occasion wear kurtis.",
                "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
                "display_order": 1
            },
            {
                "name": "Sarees",
                "slug": "sarees",
                "description": "Timeless Banarasi, Organza, Kanjeevaram and Chiffon designer sarees.",
                "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                "display_order": 2
            },
            {
                "name": "Western Wear",
                "slug": "western-wear",
                "description": "Tailored blazers, elegant coordinates, jumpsuits, and smart shirts.",
                "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
                "display_order": 3
            },
            {
                "name": "Dresses",
                "slug": "dresses",
                "description": "Bespoke evening gowns, floral sundresses, and luxury satin midi dresses.",
                "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
                "display_order": 4
            },
            {
                "name": "Tops",
                "slug": "tops",
                "description": "Silk blouses, embroidered tunics, and everyday premium essentials.",
                "image_url": "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80",
                "display_order": 5
            },
            {
                "name": "Ethnic Wear",
                "slug": "ethnic-wear",
                "description": "Regal Anarkalis, Ghararas, lehenga cholis, and royal festive ensembles.",
                "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
                "display_order": 6
            },
            {
                "name": "Party Wear",
                "slug": "party-wear",
                "description": "Glamorous sequinned cocktail gowns, shimmer silhouettes, and couture party wear.",
                "image_url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
                "display_order": 7
            },
            {
                "name": "Casual Wear",
                "slug": "casual-wear",
                "description": "Breathable pure cotton co-ord sets, easy-breezy day wear, and tiered skirts.",
                "image_url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
                "display_order": 8
            }
        ]

        cat_map = {}
        for c in categories_data:
            existing = db.query(Category).filter(Category.slug == c["slug"]).first()
            if not existing:
                cat = Category(
                    name=c["name"],
                    slug=c["slug"],
                    description=c["description"],
                    image_url=c["image_url"],
                    display_order=c["display_order"],
                    is_active=True
                )
                db.add(cat)
                db.flush()
                cat_map[c["slug"]] = cat
            else:
                cat_map[c["slug"]] = existing

        # 3. Promotional Offers
        now = datetime.now(timezone.utc)
        festive_offer = db.query(Offer).filter(Offer.title == "Festive Glamour Sale").first()
        if not festive_offer:
            festive_offer = Offer(
                title="Festive Glamour Sale",
                description="Enjoy flat 25% OFF on all signature Ethnic Wear and Designer Sarees. Limited physical store stock.",
                discount_percentage=25.0,
                promo_code="FESTIVE25",
                badge_text="25% OFF",
                banner_image="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80",
                start_date=now - timedelta(days=2),
                expiry_date=now + timedelta(days=28),
                is_active=True
            )
            db.add(festive_offer)

        summer_offer = db.query(Offer).filter(Offer.title == "New Season Welcome").first()
        if not summer_offer:
            summer_offer = Offer(
                title="New Season Welcome",
                description="15% OFF across fresh western arrivals and resort dresses.",
                discount_percentage=15.0,
                promo_code="AURA15",
                badge_text="NEW ARRIVAL SALE",
                banner_image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
                start_date=now - timedelta(days=1),
                expiry_date=now + timedelta(days=45),
                is_active=True
            )
            db.add(summer_offer)

        db.flush()

        # 4. Products with images and variant stock
        products_seed = [
            {
                "sku": "KRT-2601-01",
                "name": "Zari Embroidered Chanderi Kurti",
                "slug": "zari-embroidered-chanderi-kurti",
                "category_slug": "kurtis",
                "description": "Crafted from hand-woven Chanderi silk fabric with intricate gold Zari thread work along the neckline and cuffs. Features side slits and a soft mulmul lining for supreme comfort. Perfect for festive celebrations and intimate gatherings.",
                "original_price": 2899.0,
                "discounted_price": 2199.0,
                "discount_percentage": 24.1,
                "is_featured": True,
                "is_new_arrival": True,
                "is_on_offer": True,
                "offer_label": "24% OFF",
                "images": [
                    ("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80", False),
                ],
                "variants": [
                    ("S", "Sage Green", "#87A96B", 6),
                    ("M", "Sage Green", "#87A96B", 8),
                    ("L", "Sage Green", "#87A96B", 4),
                    ("XL", "Sage Green", "#87A96B", 2),
                    ("M", "Powder Blue", "#B0E0E6", 5),
                    ("L", "Powder Blue", "#B0E0E6", 3)
                ]
            },
            {
                "sku": "SAR-2601-02",
                "name": "Royal Banarasi Silk Saree with Meenakari Border",
                "slug": "royal-banarasi-silk-saree-meenakari",
                "category_slug": "sarees",
                "description": "An heirloom masterpiece woven in pure Katan silk. The pallu features traditional Mughal floral motifs rendered in resplendent Meenakari gold and ruby thread work. Comes with an unstitched matching blouse piece with sleeve border.",
                "original_price": 8499.0,
                "discounted_price": 6374.0,
                "discount_percentage": 25.0,
                "is_featured": True,
                "is_new_arrival": False,
                "is_on_offer": True,
                "offer_label": "FESTIVE 25% OFF",
                "images": [
                    ("https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("Free Size", "Deep Crimson Red", "#990000", 5),
                    ("Free Size", "Peacock Blue", "#004953", 3),
                    ("Free Size", "Rani Pink", "#E0115F", 4)
                ]
            },
            {
                "sku": "DRS-2601-03",
                "name": "Satin Cowl-Neck Slip Midi Dress",
                "slug": "satin-cowl-neck-slip-midi-dress",
                "category_slug": "dresses",
                "description": "Minimalist luxury at its finest. Cut on the bias from heavyweight lustrous satin, this slip dress glides effortlessly over the body. Features adjustable criss-cross back straps and a fluid asymmetric hem.",
                "original_price": 3499.0,
                "discounted_price": 2974.0,
                "discount_percentage": 15.0,
                "is_featured": True,
                "is_new_arrival": True,
                "is_on_offer": True,
                "offer_label": "NEW ARRIVAL",
                "images": [
                    ("https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("XS", "Champagne Gold", "#F7E7CE", 3),
                    ("S", "Champagne Gold", "#F7E7CE", 5),
                    ("M", "Champagne Gold", "#F7E7CE", 7),
                    ("L", "Champagne Gold", "#F7E7CE", 4),
                    ("S", "Midnight Emerald", "#097969", 4),
                    ("M", "Midnight Emerald", "#097969", 2)
                ]
            },
            {
                "sku": "WST-2601-04",
                "name": "Linen Blend Belted Wide-Leg Jumpsuit",
                "slug": "linen-blend-belted-wide-leg-jumpsuit",
                "category_slug": "western-wear",
                "description": "Effortless daytime sophistication. Tailored from a breathable French linen-cotton blend with notch lapels, self-fabric buckle belt, deep in-seam pockets, and an elongated wide-leg silhouette.",
                "original_price": 4199.0,
                "discounted_price": None,
                "discount_percentage": 0.0,
                "is_featured": False,
                "is_new_arrival": True,
                "is_on_offer": False,
                "offer_label": None,
                "images": [
                    ("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("S", "Oatmeal Beige", "#E1D9D1", 5),
                    ("M", "Oatmeal Beige", "#E1D9D1", 6),
                    ("L", "Oatmeal Beige", "#E1D9D1", 3),
                    ("XL", "Oatmeal Beige", "#E1D9D1", 1)
                ]
            },
            {
                "sku": "ETH-2601-05",
                "name": "Georgette Tiered Anarkali Suit with Organza Dupatta",
                "slug": "georgette-tiered-anarkali-suit-organza-dupatta",
                "category_slug": "ethnic-wear",
                "description": "A sweeping 48-inch flare Anarkali suit tailored in soft micro-georgette with delicate thread and sequin embroidery across the yoke. Accompanied by a scalloped digital printed organza dupatta and churidar pants.",
                "original_price": 6999.0,
                "discounted_price": 5249.0,
                "discount_percentage": 25.0,
                "is_featured": True,
                "is_new_arrival": True,
                "is_on_offer": True,
                "offer_label": "25% OFF SALE",
                "images": [
                    ("https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("M", "Blush Rose Pink", "#FFB6C1", 4),
                    ("L", "Blush Rose Pink", "#FFB6C1", 5),
                    ("XL", "Blush Rose Pink", "#FFB6C1", 2),
                    ("XXL", "Blush Rose Pink", "#FFB6C1", 1)
                ]
            },
            {
                "sku": "PTY-2601-06",
                "name": "Hand-Embroidered Sequin Corset Evening Gown",
                "slug": "hand-embroidered-sequin-corset-evening-gown",
                "category_slug": "party-wear",
                "description": "Show-stopping glamour for cocktail evenings and red carpet galas. Structured boned corset bodice adorned with tonal micro-sequins leading into a dramatically draped high-slit crepe skirt.",
                "original_price": 9999.0,
                "discounted_price": 7999.0,
                "discount_percentage": 20.0,
                "is_featured": True,
                "is_new_arrival": False,
                "is_on_offer": True,
                "offer_label": "HOT SELLER",
                "images": [
                    ("https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("S", "Obsidian Black", "#1B1B1B", 3),
                    ("M", "Obsidian Black", "#1B1B1B", 4),
                    ("L", "Obsidian Black", "#1B1B1B", 2),
                    ("M", "Burgundy Wine", "#800020", 2)
                ]
            },
            {
                "sku": "TOP-2601-07",
                "name": "Pure Mulberry Silk Pussy-Bow Blouse",
                "slug": "pure-mulberry-silk-pussy-bow-blouse",
                "category_slug": "tops",
                "description": "An opulent wardrobe anchor crafted from 19 momme Mulberry silk satin. Features a tie-neck scarf collar that can be styled into a romantic bow or left loose for relaxed elegance.",
                "original_price": 3199.0,
                "discounted_price": 2719.0,
                "discount_percentage": 15.0,
                "is_featured": False,
                "is_new_arrival": True,
                "is_on_offer": True,
                "offer_label": "15% OFF",
                "images": [
                    ("https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("XS", "Ivory Pearl", "#FFFFF0", 4),
                    ("S", "Ivory Pearl", "#FFFFF0", 6),
                    ("M", "Ivory Pearl", "#FFFFF0", 7),
                    ("L", "Ivory Pearl", "#FFFFF0", 3)
                ]
            },
            {
                "sku": "CAS-2601-08",
                "name": "Block-Printed Organic Cotton Co-ord Set",
                "slug": "block-printed-organic-cotton-coord-set",
                "category_slug": "casual-wear",
                "description": "Hand block-printed by traditional artisans in Jaipur using eco-friendly vegetable dyes. Comprises a relaxed collared notch shirt with mother-of-pearl buttons paired with elasticated straight-leg trousers.",
                "original_price": 2499.0,
                "discounted_price": 1999.0,
                "discount_percentage": 20.0,
                "is_featured": True,
                "is_new_arrival": True,
                "is_on_offer": True,
                "offer_label": "20% OFF",
                "images": [
                    ("https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", True),
                    ("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80", False)
                ],
                "variants": [
                    ("S", "Indigo Floral", "#1F3A52", 6),
                    ("M", "Indigo Floral", "#1F3A52", 8),
                    ("L", "Indigo Floral", "#1F3A52", 5),
                    ("XL", "Indigo Floral", "#1F3A52", 3),
                    ("XXL", "Indigo Floral", "#1F3A52", 2)
                ]
            }
        ]

        meta_seeded = db.query(SystemMeta).filter(SystemMeta.key == "catalog_seeded").first()
        has_existing_products = db.query(Product).count() > 0

        # Protect against re-seeding if catalog was already initialized
        if not meta_seeded and has_existing_products:
            meta_seeded = SystemMeta(key="catalog_seeded", value="true")
            db.add(meta_seeded)
            db.flush()

        if (not meta_seeded) or force:
            for p_data in products_seed:
                existing = db.query(Product).filter(Product.sku == p_data["sku"]).first()
                if not existing:
                    cat = cat_map.get(p_data["category_slug"])
                    if not cat:
                        continue

                    prod = Product(
                        sku=p_data["sku"],
                        name=p_data["name"],
                        slug=p_data["slug"],
                        description=p_data["description"],
                        category_id=cat.id,
                        original_price=p_data["original_price"],
                        discounted_price=p_data["discounted_price"],
                        discount_percentage=p_data["discount_percentage"],
                        is_featured=p_data["is_featured"],
                        is_new_arrival=p_data["is_new_arrival"],
                        is_on_offer=p_data["is_on_offer"],
                        offer_label=p_data["offer_label"],
                        is_active=True
                    )
                    db.add(prod)
                    db.flush()

                    # Add images
                    for idx, (img_url, is_prim) in enumerate(p_data["images"]):
                        img = ProductImage(
                            product_id=prod.id,
                            image_url=img_url,
                            is_primary=is_prim,
                            display_order=idx,
                            alt_text=f"{prod.name} view {idx+1}"
                        )
                        db.add(img)

                    # Add variants
                    for size, colour, colour_hex, qty in p_data["variants"]:
                        var = ProductVariant(
                            product_id=prod.id,
                            size=size,
                            colour=colour,
                            colour_hex=colour_hex,
                            stock_quantity=qty,
                            sku_suffix=f"{prod.sku}-{size}"
                        )
                        db.add(var)

                    # Attach offer if applicable
                    if p_data["is_on_offer"] and festive_offer:
                        prod.offers.append(festive_offer)

                    print(f"Seeded product: {prod.name} ({prod.sku})")

            if not meta_seeded:
                meta_seeded = SystemMeta(key="catalog_seeded", value="true")
                db.add(meta_seeded)
            else:
                meta_seeded.value = "true"
        else:
            print("Initial demo products already seeded; preserving user modifications and deletions.")

        # Store Setting initialization
        existing_setting = db.query(StoreSetting).first()
        if not existing_setting:
            new_setting = StoreSetting(
                store_name="Jershiha Fashion",
                tagline="Curated Women's Fashion & Ethnic Couture",
                whatsapp_number="919876543210",
                phone="+91 98765 43210",
                email="care@jershihafashion.com",
                address="Plot 42, Galleria High Street, Indiranagar, Bangalore - 560038",
                hours="Mon - Sun: 10:30 AM - 9:00 PM",
                maps_embed_url="https://maps.google.com/maps?q=Indiranagar+Bangalore&t=&z=15&ie=UTF8&iwloc=&output=embed"
            )
            db.add(new_setting)

        db.commit()
        print("Database seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

