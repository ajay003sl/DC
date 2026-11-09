import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, Settings, ExternalLink, LogOut, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { storeInfo } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Stock', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full bg-[#1A1A1A] text-white">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2C2C2C] flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <Link to="/admin" onClick={onClose} className="flex items-center gap-3 group">
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
                  className="w-12 h-12 object-cover rounded-full border border-[#D4AF37]/60 shadow-md flex-shrink-0"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <span className="font-serif text-base sm:text-lg tracking-[0.08em] font-medium text-white uppercase block leading-tight">
                  {storeInfo?.store_name || 'JERSHIHA FASHION'}
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#C5A880] tracking-widest uppercase font-semibold">
                  <Sparkles className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                  <span>Store Admin Portal</span>
                </div>
              </div>
            </Link>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 text-[#8C827A] hover:text-white flex-shrink-0 ml-2"
              aria-label="Close admin menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-none text-xs uppercase tracking-wider font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-[#1A1A1A] font-semibold shadow-sm'
                    : 'text-[#A8A096] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & footer */}
      <div className="p-4 border-t border-[#2C2C2C] space-y-3">
        {user && (
          <div className="px-3 py-2 bg-white/5 text-xs text-[#A8A096]">
            <p className="text-[10px] uppercase tracking-wider text-[#C5A880] font-semibold">Logged in as:</p>
            <p className="text-white truncate font-medium">{user.full_name}</p>
            <p className="text-[10px] text-[#8C827A] truncate">{user.email}</p>
          </div>
        )}

        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[#A8A096] hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>View Public Storefront</span>
          </span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white">Live</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[#2C2C2C] flex-shrink-0 min-h-screen">
        {content}
      </aside>

      {/* Mobile Drawer with Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm flex">
          <div className="w-64 max-w-[80vw] h-full shadow-2xl animate-slideRight">
            {content}
          </div>
          <div className="flex-1" onClick={onClose} />
        </div>
      )}
    </>
  );
};
