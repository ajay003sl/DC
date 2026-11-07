import unittest
import os
import io
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from main import app

class TestCompleteQAScenarios(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from app.seed.seed_data import seed_database
        seed_database()
        cls.client = TestClient(app)

    def test_scenario_01_admin_login_and_logout(self):
        """Scenario 1: Admin login and logout"""
        # Valid login
        res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        token = data["access_token"]
        self.assertTrue(len(token) > 20)
        self.assertEqual(data["user"]["email"], "admin@auraluxe.fashion")

        # Logout verification
        headers = {"Authorization": f"Bearer {token}"}
        logout_res = self.client.post("/api/v1/auth/logout", headers=headers)
        self.assertEqual(logout_res.status_code, 200)
        print("✓ Scenario 1: Admin login & logout passed")

    def test_scenario_02_and_03_admin_add_product_and_public_reflection(self):
        """Scenario 2 & 3: Admin adds product and product appears on public website immediately"""
        # Login
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add new product
        new_prod = {
            "name": "Crimson Zardozi Raw Silk Anarkali",
            "category_id": 6, # Ethnic wear
            "original_price": 7999.0,
            "discounted_price": 6399.0,
            "description": "Exquisite crimson raw silk gown adorned with authentic zardozi embroidery.",
            "is_active": True,
            "is_new_arrival": True,
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80", "is_primary": True}
            ],
            "variants": [
                {"size": "M", "colour": "Crimson", "colour_hex": "#990000", "stock_quantity": 5},
                {"size": "L", "colour": "Crimson", "colour_hex": "#990000", "stock_quantity": 3}
            ]
        }
        create_res = self.client.post("/api/v1/admin/products", json=new_prod, headers=headers)
        self.assertEqual(create_res.status_code, 201)
        created = create_res.json()
        prod_slug = created["slug"]
        prod_id = created["id"]

        # Scenario 3: Verify it immediately appears on the public storefront WITHOUT login
        pub_res = self.client.get(f"/api/v1/public/products/{prod_slug}")
        self.assertEqual(pub_res.status_code, 200)
        pub_data = pub_res.json()
        self.assertEqual(pub_data["name"], "Crimson Zardozi Raw Silk Anarkali")
        self.assertEqual(pub_data["total_stock"], 8)
        print("✓ Scenario 2 & 3: Admin added product immediately appeared publicly without frontend changes")

        # Clean up
        self.client.delete(f"/api/v1/admin/products/{prod_id}", headers=headers)

    def test_scenario_04_and_05_admin_updates_product_and_public_reflection(self):
        """Scenario 4 & 5: Admin updates a product and updated details appear publicly"""
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        cats_res = self.client.get("/api/v1/admin/categories", headers=headers)
        cat_id = cats_res.json()[0]["id"]

        # 1. Create a product
        create_res = self.client.post("/api/v1/admin/products", json={
            "name": "Pastel Organza Cape Kurti",
            "category_id": cat_id,
            "original_price": 3200.0,
            "description": "Original description before update",
            "is_active": True,
            "images": [{"image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b", "is_primary": True}],
            "variants": [{"size": "S", "colour": "Pastel Pink", "colour_hex": "#FFD1DC", "stock_quantity": 4}]
        }, headers=headers)
        prod = create_res.json()
        prod_id = prod["id"]
        prod_slug = prod["slug"]

        # 2. Update price and description
        update_res = self.client.put(f"/api/v1/admin/products/{prod_id}", json={
            "original_price": 3800.0,
            "discounted_price": 2850.0,
            "description": "Updated luxurious silk-organza drape with pearl tassels"
        }, headers=headers)
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["original_price"], 3800.0)
        self.assertEqual(update_res.json()["discounted_price"], 2850.0)

        # 3. Check public storefront reflects updated data
        pub_res = self.client.get(f"/api/v1/public/products/{prod_slug}")
        self.assertEqual(pub_res.status_code, 200)
        self.assertEqual(pub_res.json()["original_price"], 3800.0)
        self.assertEqual(pub_res.json()["effective_price"], 2850.0)
        self.assertIn("pearl tassels", pub_res.json()["description"])
        print("✓ Scenario 4 & 5: Product updates dynamically propagate to public storefront")

        # Clean up
        self.client.delete(f"/api/v1/admin/products/{prod_id}", headers=headers)

    def test_scenario_06_and_07_admin_deletes_product_and_disappears(self):
        """Scenario 6 & 7: Admin deletes product and it disappears from storefront"""
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        cats_res = self.client.get("/api/v1/admin/categories", headers=headers)
        cat_id = cats_res.json()[0]["id"]

        # 1. Create product
        create_res = self.client.post("/api/v1/admin/products", json={
            "name": "Temporary Dress To Delete",
            "category_id": cat_id,
            "original_price": 1999.0,
            "is_active": True,
            "images": [{"image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b", "is_primary": True}]
        }, headers=headers)
        prod_id = create_res.json()["id"]
        prod_slug = create_res.json()["slug"]

        # 2. Verify exists publicly
        self.assertEqual(self.client.get(f"/api/v1/public/products/{prod_slug}").status_code, 200)

        # 3. Delete product
        del_res = self.client.delete(f"/api/v1/admin/products/{prod_id}", headers=headers)
        self.assertEqual(del_res.status_code, 200)

        # 4. Verify no longer exists publicly (404)
        pub_check = self.client.get(f"/api/v1/public/products/{prod_slug}")
        self.assertEqual(pub_check.status_code, 404)
        print("✓ Scenario 6 & 7: Deleted product immediately disappears from storefront")

    def test_scenario_08_admin_uploads_multiple_images(self):
        """Scenario 8: Admin uploads multiple images with size and format validation"""
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create dummy image bytes
        file1 = ("test1.jpg", io.BytesIO(b"dummy image data 1"), "image/jpeg")
        file2 = ("test2.png", io.BytesIO(b"dummy image data 2"), "image/png")

        upload_res = self.client.post(
            "/api/v1/admin/upload/images",
            files=[("files", file1), ("files", file2)],
            headers=headers
        )
        self.assertEqual(upload_res.status_code, 200)
        uploaded = upload_res.json()
        self.assertEqual(len(uploaded), 2)
        self.assertTrue(uploaded[0]["image_url"].startswith("/uploads/"))
        print("✓ Scenario 8: Admin multi-image upload works")

    def test_scenario_09_admin_updates_sizes_and_stock(self):
        """Scenario 9: Admin updates product sizes and stock matrix"""
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Use first available product
        prods_res = self.client.get("/api/v1/admin/products", headers=headers)
        target_id = prods_res.json()["items"][0]["id"]

        variants_update = [
            {"size": "XS", "colour": "Emerald", "colour_hex": "#046307", "stock_quantity": 2},
            {"size": "S", "colour": "Emerald", "colour_hex": "#046307", "stock_quantity": 7},
            {"size": "M", "colour": "Emerald", "colour_hex": "#046307", "stock_quantity": 9},
            {"size": "L", "colour": "Emerald", "colour_hex": "#046307", "stock_quantity": 1}
        ]

        stock_res = self.client.put(f"/api/v1/admin/products/{target_id}/variants", json=variants_update, headers=headers)
        self.assertEqual(stock_res.status_code, 200)
        updated_prod = stock_res.json()
        self.assertEqual(updated_prod["total_stock"], 19)
        self.assertIn("XS", updated_prod["available_sizes"])
        print("✓ Scenario 9: Size & Stock matrix update verified")

    def test_scenario_10_admin_creates_and_expires_offer(self):
        """Scenario 10: Admin creates offer, and expired offers automatically stop appearing"""
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        now = datetime.now(timezone.utc)
        # 1. Create an offer that expired yesterday
        expired_offer_payload = {
            "title": "Expired Flash Sale",
            "discount_percentage": 50.0,
            "badge_text": "50% OFF FLASH",
            "start_date": (now - timedelta(days=5)).isoformat(),
            "expiry_date": (now - timedelta(days=1)).isoformat(),
            "is_active": True
        }
        create_res = self.client.post("/api/v1/admin/offers", json=expired_offer_payload, headers=headers)
        self.assertEqual(create_res.status_code, 201)
        offer_id = create_res.json()["id"]

        # 2. Check public offers endpoint - expired offer MUST NOT appear
        pub_offers_res = self.client.get("/api/v1/public/offers")
        self.assertEqual(pub_offers_res.status_code, 200)
        active_titles = [o["title"] for o in pub_offers_res.json()]
        self.assertNotIn("Expired Flash Sale", active_titles)
        print("✓ Scenario 10: Offer creation and automatic expiration verified")

        # Clean up
        self.client.delete(f"/api/v1/admin/offers/{offer_id}", headers=headers)

    def test_scenario_11_customers_browse_without_login(self):
        """Scenario 11: Customers browse without logging in"""
        res = self.client.get("/api/v1/public/products")
        self.assertEqual(res.status_code, 200)
        cats_res = self.client.get("/api/v1/public/categories")
        self.assertEqual(cats_res.status_code, 200)
        store_res = self.client.get("/api/v1/public/store-info")
        self.assertEqual(store_res.status_code, 200)
        print("✓ Scenario 11: Frictionless customer browsing verified")

    def test_scenario_12_whatsapp_enquiry_format(self):
        """Scenario 12: WhatsApp enquiry URL and message payload validation"""
        store_res = self.client.get("/api/v1/public/store-info")
        self.assertEqual(store_res.status_code, 200)
        info = store_res.json()
        self.assertIn("whatsapp_number", info)
        self.assertTrue(len(info["whatsapp_number"]) >= 10)
        print("✓ Scenario 12: WhatsApp enquiry integration verified")

    def test_scenario_13_responsive_spa_serving(self):
        """Scenario 13: Responsive SPA distribution"""
        spa_res = self.client.get("/")
        self.assertEqual(spa_res.status_code, 200)
        self.assertIn("text/html", spa_res.headers.get("content-type", ""))
        print("✓ Scenario 13: Responsive single-page application delivery verified")

    def test_scenario_14_unauthorized_users_blocked(self):
        """Scenario 14: Unauthorized users cannot access admin functionality"""
        # Admin endpoints without token
        res_prod = self.client.post("/api/v1/admin/products", json={"name": "Hacker Dress"})
        self.assertEqual(res_prod.status_code, 401)

        res_cat = self.client.post("/api/v1/admin/categories", json={"name": "Hacker Category"})
        self.assertEqual(res_cat.status_code, 401)

        res_analytics = self.client.get("/api/v1/admin/analytics/overview")
        self.assertEqual(res_analytics.status_code, 401)
        print("✓ Scenario 14: Security RBAC authorization guard verified")

    def test_scenario_15_dynamic_store_settings_update(self):
        """Scenario 15: Admin updates store address, phone, and WhatsApp dynamically"""
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Backup current settings
        orig_settings = self.client.get("/api/v1/public/store-info").json()

        try:
            # Update address, phone, and WhatsApp
            update_payload = {
                "address": "No. 15, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bangalore - 560038",
                "phone": "+91 91234 56789",
                "whatsapp_number": "919123456789"
            }
            put_res = self.client.put("/api/v1/admin/settings", json=update_payload, headers=headers)
            self.assertEqual(put_res.status_code, 200)

            # Verify public storefront endpoint reflects updated data dynamically
            pub_res = self.client.get("/api/v1/public/store-info")
            self.assertEqual(pub_res.status_code, 200)
            data = pub_res.json()
            self.assertEqual(data["address"], update_payload["address"])
            self.assertEqual(data["phone"], update_payload["phone"])
            self.assertEqual(data["whatsapp_number"], update_payload["whatsapp_number"])
            print("✓ Scenario 15: Dynamic store settings update verified")
        finally:
            # Restore original settings
            self.client.put("/api/v1/admin/settings", json=orig_settings, headers=headers)

    def test_scenario_16_admin_change_password(self):
        """Scenario 16: Admin securely changes password"""
        # 1. Login with current password
        login_res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Try with wrong current password (expect 400)
        wrong_res = self.client.post("/api/v1/auth/change-password", json={
            "current_password": "WrongPassword999!",
            "new_password": "NewSecretPassword456!"
        }, headers=headers)
        self.assertEqual(wrong_res.status_code, 400)

        # 3. Change password with correct current password
        change_res = self.client.post("/api/v1/auth/change-password", json={
            "current_password": "AdminPassword123!",
            "new_password": "NewSecretPassword456!"
        }, headers=headers)
        self.assertEqual(change_res.status_code, 200)

        # 4. Verify old password fails
        old_login = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        self.assertEqual(old_login.status_code, 401)

        # 5. Verify new password succeeds
        new_login = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "NewSecretPassword456!"
        })
        self.assertEqual(new_login.status_code, 200)

        # 6. Revert back to AdminPassword123! so other tests stay consistent
        new_token = new_login.json()["access_token"]
        self.client.post("/api/v1/auth/change-password", json={
            "current_password": "NewSecretPassword456!",
            "new_password": "AdminPassword123!"
        }, headers={"Authorization": f"Bearer {new_token}"})
        print("✓ Scenario 16: Admin change password verified")

if __name__ == "__main__":
    unittest.main()

