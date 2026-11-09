import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, MessageCircle, Sparkles, ChevronDown, ChevronRight, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const { categories, storeInfo } = useStore();
  const { totalCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer and search on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const whatsappPhone = storeInfo?.whatsapp_number || '918925184903';
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I would like to enquire about your boutique collection.')}`;
  const storeHours = storeInfo?.hours || 'Mon - Sun: 10:30 AM - 9:00 PM';

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EAE6E1]">
      {/* Top boutique announcement ribbon */}
      <div className="bg-[#1A1A1A] text-[#FAF7F2] text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 text-center tracking-widest uppercase flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
        <span className="truncate">Physical Boutique Open: {storeHours}</span>
        <span className="hidden md:inline">• Direct WhatsApp Assistance Available</span>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-boutique-charcoal hover:text-black focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Brand Name */}
          <div className="flex-1 md:flex-initial text-center md:text-left flex-shrink-0">
            <Link to="/" className="inline-flex items-center gap-3 group py-1">
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
                  className="w-11 h-11 sm:w-13 sm:h-13 object-cover rounded-full border border-[#D5C4B0] shadow-sm flex-shrink-0"
                />
              ) : null}
              <div className="flex flex-col justify-center text-left">
                <span className="font-serif text-lg sm:text-xl lg:text-2xl tracking-[0.12em] font-medium text-[#1A1A1A] uppercase transition-colors group-hover:text-boutique-terracotta leading-tight whitespace-nowrap block">
                  {storeInfo?.store_name || 'JERSHIHA FASHION'}
                </span>
                <span className="block text-[8px] sm:text-[9px] tracking-[0.25em] text-[#8C827A] uppercase mt-0.5 whitespace-nowrap font-medium">
                  Women's Fashion & Custom Fit
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-8">
            <Link
              to="/"
              className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-boutique-terracotta ${
                location.pathname === '/' ? 'text-boutique-terracotta font-semibold' : 'text-boutique-charcoal'
              }`}
            >
              Home
            </Link>

            <Link
              to="/shop"
              className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-boutique-terracotta ${
                location.pathname === '/shop' ? 'text-boutique-terracotta font-semibold' : 'text-boutique-charcoal'
              }`}
            >
              All Dresses
            </Link>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoryDropdown(true)}
              onMouseLeave={() => setCategoryDropdown(false)}
            >
              <button
                className="flex items-center gap-1 text-sm tracking-wider uppercase font-medium text-boutique-charcoal hover:text-boutique-terracotta py-2"
              >
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {categoryDropdown && (
                <div className="absolute top-full left-0 w-64 bg-[#FDFBF7] shadow-xl border border-[#EAE6E1] py-3 rounded-sm z-50 animate-fadeIn">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/?category=${cat.slug}`}
                      onClick={() => setCategoryDropdown(false)}
                      className="block px-5 py-2 text-sm text-boutique-charcoal hover:bg-[#FAF7F2] hover:text-boutique-terracotta transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span>{cat.name}</span>
                        {cat.product_count !== undefined && cat.product_count > 0 && (
                          <span className="text-xs text-[#8C827A]">({cat.product_count})</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-boutique-terracotta ${
                location.pathname === '/about' ? 'text-boutique-terracotta font-semibold' : 'text-boutique-charcoal'
              }`}
            >
              Our Boutique
            </Link>

            <Link
              to="/contact"
              className={`text-sm tracking-wider uppercase font-medium transition-colors hover:text-boutique-terracotta ${
                location.pathname === '/contact' ? 'text-boutique-terracotta font-semibold' : 'text-boutique-charcoal'
              }`}
            >
              Visit Store
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-boutique-charcoal hover:text-boutique-terracotta transition-colors"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Bag Button */}
            <Link
              to="/cart"
              className="relative p-2 text-boutique-charcoal hover:text-boutique-terracotta transition-colors flex items-center gap-1.5"
              aria-label="View Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* WhatsApp direct chat */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-[#EAE6E1] animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3 w-5 h-5 text-[#8C827A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dresses, designs, collections..."
                className="w-full pl-11 pr-24 py-2.5 bg-white border border-[#D5C4B0] text-sm rounded-none focus:outline-none focus:border-boutique-charcoal placeholder-[#9C948B]"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider hover:bg-black transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation (True Luxury Full-Height Slide-Out Portal) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden overflow-hidden touch-none overscroll-none">
          {/* Animated Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Luxury Drawer Panel */}
          <div className="fixed top-0 bottom-0 left-0 w-[85vw] max-w-[320px] h-screen h-[100dvh] bg-[#FAF7F2] shadow-2xl flex flex-col z-[101] animate-slideDrawerIn border-r border-[#EAE6E1] overscroll-contain touch-auto">
            {/* Drawer Top Header */}
            <div className="p-4 bg-white border-b border-[#EAE6E1] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
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
                    className="w-10 h-10 object-cover rounded-full border border-[#D5C4B0] flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center font-serif text-sm font-semibold flex-shrink-0">
                    JF
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif text-sm font-medium tracking-[0.14em] text-[#1A1A1A] uppercase truncate">
                    {storeInfo?.store_name || 'JERSHIHA FASHION'}
                  </h3>
                  <p className="text-[9px] tracking-[0.2em] text-[#8C827A] uppercase truncate font-medium">
                    Women's Boutique & Fit
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#5A524C] hover:text-black hover:bg-[#FAF7F2] rounded-none transition-colors border border-transparent hover:border-[#EAE6E1] flex-shrink-0 ml-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gold Ribbon Divider */}
            <div className="h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#D5C4B0] to-transparent flex-shrink-0" />

            {/* Scrollable Drawer Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
              {/* In-Drawer Quick Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dresses, designs, styles..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#D5C4B0] text-xs text-[#1A1A1A] placeholder-[#9C948B] focus:outline-none focus:border-[#1A1A1A] rounded-none shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-2.5" />
              </form>

              {/* Primary Navigation Links */}
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs uppercase tracking-[0.16em] font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'bg-white text-[#7A5835] font-semibold border-l-2 border-[#D4AF37] shadow-2xs'
                      : 'text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C827A]" />
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 text-xs uppercase tracking-[0.16em] font-medium transition-colors ${
                    location.pathname === '/shop'
                      ? 'bg-white text-[#7A5835] font-semibold border-l-2 border-[#D4AF37] shadow-2xs'
                      : 'text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>All Collections</span>
                    <span className="px-1.5 py-0.2 bg-[#FAF7F2] border border-[#EAE6E1] text-[9px] text-[#7A5835]">
                      Catalog
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C827A]" />
                </Link>
              </div>

              {/* Collections & Categories Section */}
              <div className="pt-2 border-t border-[#EAE6E1]">
                <div className="px-3 mb-2 flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C827A] font-semibold">
                    Curated Categories
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] text-[#7A5835] font-medium hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-1">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/?category=${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 bg-white/70 hover:bg-white border border-[#EAE6E1] transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt={c.name}
                            className="w-7 h-7 rounded-full object-cover border border-[#D5C4B0] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7A5835] border border-[#EAE6E1] flex items-center justify-center font-serif text-[11px] font-semibold flex-shrink-0">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-serif text-xs font-medium text-[#1A1A1A] group-hover:text-[#7A5835] truncate">
                          {c.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#FAF7F2] border border-[#EAE6E1] text-[#7A5835] font-semibold flex-shrink-0">
                        {c.product_count || 0}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Boutique Story & Contact */}
              <div className="pt-2 border-t border-[#EAE6E1] space-y-1">
                <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.2em] text-[#8C827A] font-semibold">
                  About Boutique
                </p>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#5A524C] hover:bg-white transition-colors"
                >
                  <span>Our Boutique Story</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C827A]" />
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#5A524C] hover:bg-white transition-colors"
                >
                  <span>Store Address & Hours</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C827A]" />
                </Link>
              </div>
            </div>

            {/* Pinned Luxury Footer Actions */}
            <div className="p-4 bg-white border-t border-[#EAE6E1] space-y-2 flex-shrink-0 shadow-lg">
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 px-4 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-[0.14em] font-medium flex items-center justify-center gap-2 shadow-sm rounded-none active:scale-[0.99] transition-all"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                <span>View Shopping Bag ({totalCount})</span>
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 px-4 bg-[#FAF7F2] hover:bg-white border border-[#D5C4B0] hover:border-[#1A1A1A] text-emerald-900 text-xs uppercase tracking-[0.14em] font-medium flex items-center justify-center gap-2 shadow-2xs rounded-none active:scale-[0.99] transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-800 fill-emerald-800/20" />
                <span>WhatsApp Boutique Stylist</span>
              </a>

              <div className="pt-1.5 text-center text-[10px] text-[#8C827A] flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span className="truncate">Bangalore Boutique • {storeInfo?.hours || 'Open Daily 10:30 AM - 9:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

