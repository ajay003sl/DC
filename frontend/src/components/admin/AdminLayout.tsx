import React, { useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { Menu, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { storeInfo } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-boutique-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#8C827A]">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F3]">
      {/* Mobile Top App Bar for Admin */}
      <header className="md:hidden bg-[#1A1A1A] text-white px-4 py-3 flex items-center justify-between border-b border-[#2C2C2C] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-[#A8A096] hover:text-white"
            aria-label="Open admin menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            {storeInfo?.logo_url ? (
              <img
                src={storeInfo.logo_url}
                alt={storeInfo.store_name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('8559d870')) {
                    target.src = '/uploads/8559d870-3228-48ce-af98-cc1677ad15e9.jpg';
                  } else {
                    target.style.display = 'none';
                  }
                }}
                className="w-8 h-8 object-cover rounded-full border border-[#D4AF37]/60 shadow-sm flex-shrink-0"
              />
            ) : null}
            <div className="min-w-0">
              <span className="font-serif text-base tracking-wider uppercase font-medium block leading-tight truncate">
                {storeInfo?.store_name || 'JERSHIHA FASHION'}
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-[#C5A880] mt-0.5 font-semibold">Store Admin</span>
            </div>
          </div>
        </div>

        <Link
          to="/"
          target="_blank"
          className="text-xs px-2.5 py-1 bg-white/10 rounded text-[#FAF7F2] flex items-center gap-1.5 hover:bg-white/20"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Storefront</span>
        </Link>
      </header>

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
