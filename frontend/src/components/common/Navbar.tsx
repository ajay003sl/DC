import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, MessageCircle, Sparkles, ChevronDown, ShoppingBag } from 'lucide-react';
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const whatsappPhone = storeInfo?.whatsapp_number || '918925184903';
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I would like to enquire about your boutique collection.')}`;
  const storeHours = storeInfo?.hours || 'Mon - Sun: 10:00 AM - 9:00 PM';

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
                      to={`/category/${cat.slug}`}
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
            <button
              onClick={openCart}
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
            </button>

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
                placeholder="Search kurtis, sarees, cocktail dresses, satin gowns, linen jumpsuits..."
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

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FDFBF7] border-b border-[#EAE6E1] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium tracking-wider uppercase border-b border-[#F0ECE1]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium tracking-wider uppercase border-b border-[#F0ECE1]"
          >
            All Dresses
          </Link>
          <div className="py-2 border-b border-[#F0ECE1]">
            <p className="text-xs uppercase tracking-widest text-[#8C827A] mb-2 font-semibold">Categories</p>
            <div className="grid grid-cols-2 gap-2 pl-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm py-1 text-boutique-charcoal hover:text-boutique-terracotta"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium tracking-wider uppercase border-b border-[#F0ECE1]"
          >
            Our Boutique Story
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium tracking-wider uppercase border-b border-[#F0ECE1]"
          >
            Store Address & Hours
          </Link>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openCart();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide bg-[#1A1A1A] text-white hover:bg-black transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Shopping Bag ({totalCount})</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium tracking-wide bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Store</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

