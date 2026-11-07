# AURA Luxe — Women's Fashion Boutique E-Commerce & Admin Platform

A modern, responsive, full-stack women's fashion e-commerce platform and administrative dashboard built for physical boutique stores.

Customers can browse handcrafted kurtis, sarees, western wear, and evening gowns, check real-time in-store stock across size and colour variants, and immediately initiate pre-filled WhatsApp enquiries. Store owners manage products, images, stock matrices, and seasonal promotional offers through a separate administrative portal.

---

## Key Highlights

- **Dynamic Data Synchronization:** All public storefront pages retrieve live products, categories, pricing, and offers directly from the database API. Every admin change, addition, or deletion propagates instantly with zero manual frontend edits.
- **Zero-Friction Public Storefront:** No registration or login required for shoppers. Seamlessly filter by category, price slider, size (XS to XXL), colour, and sort by latest arrivals, price, or discount.
- **Direct WhatsApp Commerce:** Replaces traditional cart abandonment with direct-to-owner WhatsApp enquiries. Clicking **"Enquire on WhatsApp"** automatically compiles a pre-formatted message with Product Name, SKU, selected Size, Colour, and Price.
- **Variant Stock Matrix:** Accurate size-and-colour stock tracking (e.g. Sage Green in Size M: 8 units). Live badges warn shoppers when an item is low in physical store stock or sold out.
- **Automated Offer Engine:** Schedule promotional discounts with promo codes and expiry dates. Expired campaigns automatically disappear from the public storefront.
- **Single Turnkey Deployment:** FastAPI can run the REST API and serve the compiled React SPA simultaneously on port `8000`, or Vite dev server can run independently on port `5173`.

---

## Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite, React Router v6.
- **Backend:** Python 3, FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 validation.
- **Security:** JWT authentication with bcrypt password hashing, route-level authorization guards, CORS lockdown.
- **Database:** SQLite (default for instant zero-dependency local run) / PostgreSQL (configured via `DATABASE_URL`).
- **Media Delivery:** Optimized local static storage (`/uploads`) with built-in multi-file format and size validation.

---

## Default Admin Credentials

- **Admin Login URL:** `http://localhost:8000/admin/login` (or `http://localhost:5173/admin/login`)
- **Email:** `admin@auraluxe.fashion`
- **Password:** `AdminPassword123!`

---

## Quick Start Guide

### Option 1: Run Unified Production Server (Fastest)

1. Build the frontend (already built in `frontend/dist`):
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend:
   ```bash
   cd backend
   python3 main.py
   ```

3. Open your browser:
   - **Public Storefront:** [http://localhost:8000](http://localhost:8000)
   - **Admin Dashboard:** [http://localhost:8000/admin](http://localhost:8000/admin)
   - **Interactive API Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Run in Development Mode (with Hot Module Replacement)

1. Start FastAPI backend:
   ```bash
   cd backend
   python3 -m uvicorn main:app --reload --port 8000
   ```

2. Start Vite frontend dev server in a second terminal:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser:
   - Storefront & Admin: [http://localhost:5173](http://localhost:5173)

---

## Running the Automated Test Suite

Run the full end-to-end test suite verifying all 14 QA scenarios:

```bash
cd backend
python3 -m unittest tests/test_qa_scenarios.py
```

Test coverage includes:
1. Admin login, JWT issuance, and logout.
2. Admin creates a new product.
3. Product immediately appears on public storefront.
4. Admin updates product price and details.
5. Updated price and description reflect publicly.
6. Admin deletes product.
7. Product immediately disappears from storefront.
8. Admin uploads multiple images with size/extension checks.
9. Admin updates size and colour stock matrix.
10. Admin creates and auto-expires promotional offers.
11. Customers browse categories and products without login.
12. WhatsApp enquiry URL format validation.
13. Responsive single-page application delivery.
14. Unauthorized users are blocked from admin endpoints (401/403).

---

## Configuration & Environment Variables

Create a `.env` file in `backend/` to configure:

```ini
# Security
SECRET_KEY=aura_luxe_fashion_super_secret_jwt_key_2026_xyz123
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (PostgreSQL example)
# DATABASE_URL=postgresql://user:password@localhost:5432/aura_db
DATABASE_URL=sqlite:///./dc_store.db

# Boutique Store Profile & WhatsApp
STORE_NAME=AURA Luxe
STORE_WHATSAPP_NUMBER=919876543210
STORE_PHONE=+91 98765 43210
STORE_EMAIL=care@auraluxefashion.com
STORE_ADDRESS=Plot 42, Galleria High Street, Indiranagar, Bangalore - 560038
STORE_HOURS=Mon - Sun: 10:30 AM - 9:00 PM
```

---

## License

Bespoke E-Commerce Solution for AURA Luxe Boutique. All rights reserved.

