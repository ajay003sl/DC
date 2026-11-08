import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

// Common Layouts
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { ScrollToTop } from './components/common/ScrollToTop';
import { CartDrawer } from './components/storefront/CartDrawer';
import { AdminLayout } from './components/admin/AdminLayout';

// Public Pages
import { HomePage } from './pages/storefront/HomePage';
import { ShopPage } from './pages/storefront/ShopPage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { CategoryPage } from './pages/storefront/CategoryPage';
import { AboutPage } from './pages/storefront/AboutPage';
import { ContactPage } from './pages/storefront/ContactPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Public Storefront Layout with Header and Footer
const StorefrontLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <CartDrawer />
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
            <ScrollToTop />
            <Routes>
            {/* Public Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/offers" element={<Navigate to="/shop" replace />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductEditPage />} />
              <Route path="products/:id" element={<AdminProductEditPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="offers" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* 404 Catch-All */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 text-center">
                  <h1 className="font-serif text-5xl text-boutique-charcoal mb-4">404</h1>
                  <p className="text-sm text-[#8C827A] mb-8">The page you are looking for does not exist in our catalog.</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-luxury"
                  >
                    Return to Homepage
                  </a>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;

