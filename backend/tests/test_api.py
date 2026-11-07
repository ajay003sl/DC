import unittest
from fastapi.testclient import TestClient
from main import app

class TestBoutiqueAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        # Login as admin to get token
        login_res = cls.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "AdminPassword123!"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        data = login_res.json()
        cls.token = data["access_token"]
        cls.auth_headers = {"Authorization": f"Bearer {cls.token}"}

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_02_admin_login_invalid_password(self):
        res = self.client.post("/api/v1/auth/login", json={
            "email": "admin@auraluxe.fashion",
            "password": "WrongPassword!"
        })
        self.assertEqual(res.status_code, 401)

    def test_03_admin_get_me(self):
        res = self.client.get("/api/v1/auth/me", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["email"], "admin@auraluxe.fashion")
        self.assertEqual(res.json()["role"], "admin")

    def test_04_unauthorized_access_blocked(self):
        # Admin endpoint without token should return 401
        res = self.client.get("/api/v1/admin/analytics/overview")
        self.assertEqual(res.status_code, 401)

    def test_05_public_can_browse_products_without_login(self):
        res = self.client.get("/api/v1/public/products")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("items", data)
        self.assertGreater(data["total"], 0)
        # Check first product structure
        item = data["items"][0]
        self.assertIn("name", item)
        self.assertIn("original_price", item)
        self.assertIn("primary_image_url", item)
        self.assertIn("available_sizes", item)

    def test_06_public_categories_list(self):
        res = self.client.get("/api/v1/public/categories")
        self.assertEqual(res.status_code, 200)
        cats = res.json()
        self.assertGreaterEqual(len(cats), 8)
        names = [c["name"] for c in cats]
        self.assertIn("Kurtis", names)
        self.assertIn("Sarees", names)
        self.assertIn("Dresses", names)

    def test_07_public_product_detail(self):
        # Get one product slug
        list_res = self.client.get("/api/v1/public/products")
        first_slug = list_res.json()["items"][0]["slug"]

        detail_res = self.client.get(f"/api/v1/public/products/{first_slug}")
        self.assertEqual(detail_res.status_code, 200)
        prod = detail_res.json()
        self.assertEqual(prod["slug"], first_slug)
        self.assertIn("variants", prod)
        self.assertIn("images", prod)
        self.assertGreater(len(prod["variants"]), 0)

    def test_08_admin_create_update_delete_product(self):
        # 1. Create product
        new_prod_payload = {
            "name": "Emerald Velvet Corset Kurti",
            "category_id": 1,
            "original_price": 3299.0,
            "discounted_price": 2699.0,
            "description": "Rich emerald green velvet kurti with thread zari accents.",
            "is_featured": True,
            "is_new_arrival": True,
            "is_active": True,
            "images": [
                {"image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80", "is_primary": True}
            ],
            "variants": [
                {"size": "S", "colour": "Emerald", "colour_hex": "#046307", "stock_quantity": 4},
                {"size": "M", "colour": "Emerald", "colour_hex": "#046307", "stock_quantity": 6}
            ]
        }
        create_res = self.client.post("/api/v1/admin/products", json=new_prod_payload, headers=self.auth_headers)
        self.assertEqual(create_res.status_code, 201)
        created_prod = create_res.json()
        prod_id = created_prod["id"]
        prod_slug = created_prod["slug"]

        # 2. Verify product is visible on public endpoint
        pub_res = self.client.get(f"/api/v1/public/products/{prod_slug}")
        self.assertEqual(pub_res.status_code, 200)
        self.assertEqual(pub_res.json()["name"], "Emerald Velvet Corset Kurti")

        # 3. Update product price and stock
        update_payload = {
            "original_price": 3500.0,
            "discounted_price": 2800.0,
            "is_active": False # Deactivate
        }
        upd_res = self.client.put(f"/api/v1/admin/products/{prod_id}", json=update_payload, headers=self.auth_headers)
        self.assertEqual(upd_res.status_code, 200)
        self.assertEqual(upd_res.json()["original_price"], 3500.0)

        # 4. Verify deactivated product disappears from public storefront
        pub_check = self.client.get(f"/api/v1/public/products/{prod_slug}")
        self.assertEqual(pub_check.status_code, 404)

        # 5. Delete product
        del_res = self.client.delete(f"/api/v1/admin/products/{prod_id}", headers=self.auth_headers)
        self.assertEqual(del_res.status_code, 200)

        # 6. Verify admin cannot find deleted product
        get_deleted = self.client.get(f"/api/v1/admin/products/{prod_id}", headers=self.auth_headers)
        self.assertEqual(get_deleted.status_code, 404)

    def test_09_dashboard_analytics(self):
        res = self.client.get("/api/v1/admin/analytics/overview", headers=self.auth_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_products"], 0)
        self.assertIn("category_stats", data)
        self.assertIn("low_stock_items", data)

if __name__ == "__main__":
    unittest.main()

