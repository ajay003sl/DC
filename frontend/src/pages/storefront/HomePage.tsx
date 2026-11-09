import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Search, X, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, MessageCircle, ShoppingBag } from 'lucide-react';
import { ProductCard as ProductCardType, ProductListResponse } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { QuickViewModal } from '../../components/storefront/QuickViewModal';

export const HomePage: React.FC = () => {
  const { categories, storeInfo } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const productsRef = useRef<HTMLDivElement>(null);

  // States controlled via URL parameters for seamless sharing & back-button support
  const selectedCategory = searchParams.get('category') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sort') || 'latest';
  const searchQueryParam = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchQueryParam);
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardType | null>(null);

  const PAGE_SIZE = 12;

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchQueryParam);
  }, [searchQueryParam]);

  // Fetch products whenever category, page, sort, or search changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.public.getProducts({
      page: currentPage,
      page_size: PAGE_SIZE,
      category_slug: selectedCategory || undefined,
      search: searchQueryParam.trim() || undefined,
      sort_by: sortBy,
    })
      .then((res: ProductListResponse) => {
        if (isMounted) {
          setProducts(res.items);
          setTotalProducts(res.total);
          setTotalPages(res.total_pages || 1);
        }
      })
      .catch((err) => {
        console.error('Failed to load products', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, currentPage, sortBy, searchQueryParam]);

  // Helper to update query parameters
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (!val || val === '1' && key === 'page' || val === 'latest' && key === 'sort') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next);
  };

  const handleCategorySelect = (slug: string) => {
    updateParams({ category: slug || null, page: null });
    // Smooth scroll down to products toolbar if scrolled past
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() || null, page: null });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateParams({ search: null, page: null });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: String(newPage) });
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const activeCategoryName = currentCategoryObj ? currentCategoryObj.name : 'All Dresses';
  const totalCatalogCount = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 1. Compact Clean Boutique Banner */}
      <section className="bg-[#1A1A1A] text-white py-6 sm:py-9 px-4 border-b border-[#2B2B2B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#E5D3B3] text-[10px] sm:text-xs tracking-wider uppercase font-medium mb-2">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Bangalore Boutique & Direct Online Ordering</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide text-white">
              {storeInfo?.store_name || 'Jershiha Fashion'}
            </h1>
            <p className="text-xs sm:text-sm text-[#C4BDB5] mt-1 max-w-xl font-light">
              Handpicked sarees, festive kurtis & designer dresses. Check live designs, add to your bag, or order directly via WhatsApp.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-80">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by dress name or style..."
                className="w-full pl-9 pr-9 py-2.5 bg-white text-boutique-charcoal text-xs placeholder-[#9C948B] border border-transparent focus:outline-none focus:border-[#D4AF37] rounded-none shadow-sm"
              />
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 text-[#8C827A] hover:text-black"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 2. Category Selector Section (Dropdown on Mobile, Tabs on Desktop) */}
      <section className="bg-white border-b border-[#EAE6E1] py-3.5 sm:py-4 sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Category Dropdown View (< sm) */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] flex items-center gap-1">
                <span>Select Category:</span>
              </span>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => handleCategorySelect('')}
                  className="text-[11px] text-boutique-terracotta hover:underline font-semibold"
                >
                  View All ({totalCatalogCount || totalProducts})
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full appearance-none bg-[#FAF7F2] border-2 border-[#D5C4B0] text-boutique-charcoal text-xs font-semibold py-3 pl-3.5 pr-10 rounded-none focus:outline-none focus:border-boutique-charcoal shadow-2xs"
                aria-label="Filter by Category"
              >
                <option value="">
                  All Designs ({totalCatalogCount || totalProducts})
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name} ({cat.product_count || 0})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-boutique-charcoal">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Desktop Category Tabs View (>= sm) */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A]">
                Browse Categories:
              </span>
              {selectedCategory && (
                <button
                  onClick={() => handleCategorySelect('')}
                  className="text-[11px] text-boutique-terracotta hover:underline font-medium"
                >
                  View All Categories ({totalCatalogCount || totalProducts})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
              {/* All Designs Tab */}
              <button
                onClick={() => handleCategorySelect('')}
                className={`flex-shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 rounded-xs border ${
                  selectedCategory === ''
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                    : 'bg-[#FAF7F2] text-boutique-charcoal border-[#EAE6E1] hover:border-[#D5C4B0] hover:bg-white'
                }`}
              >
                <span>All Designs</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${selectedCategory === '' ? 'bg-white/20 text-white' : 'bg-[#EAE6E1] text-[#8C827A]'}`}>
                  {totalCatalogCount || totalProducts}
                </span>
              </button>

              {/* Dynamic Category Tabs */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`flex-shrink-0 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2.5 rounded-xs border ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#FAF7F2] text-boutique-charcoal border-[#EAE6E1] hover:border-[#D5C4B0] hover:bg-white'
                    }`}
                  >
                    {cat.image_url && (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-4 h-4 rounded-full object-cover border border-white/40 flex-shrink-0"
                      />
                    )}
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#EAE6E1] text-[#8C827A]'}`}>
                      {cat.product_count || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 3. Products Section & Toolbar */}
      <section ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar: Category Title, Search Query Tag & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#EAE6E1]">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-boutique-charcoal">
              {activeCategoryName}
            </h2>
            <span className="text-xs text-[#8C827A] font-medium bg-[#FAF7F2] border border-[#EAE6E1] px-2 py-0.5 rounded-full">
              {totalProducts} {totalProducts === 1 ? 'dress' : 'dresses'}
            </span>

            {searchQueryParam && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                <span>Search: "{searchQueryParam}"</span>
                <button onClick={handleClearSearch} className="hover:text-red-700 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-[#8C827A] uppercase tracking-wider font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParams({ sort: e.target.value, page: null })}
              className="bg-white border border-[#D5C4B0] text-xs font-medium py-1.5 px-2.5 text-boutique-charcoal focus:outline-none cursor-pointer shadow-2xs"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-[#EAE6E1] aspect-[3/4] animate-pulse p-4 flex flex-col justify-end">
                <div className="h-4 bg-gray-200 mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#EAE6E1] p-8 space-y-4">
            <div className="w-14 h-14 bg-[#FAF7F2] border border-[#EAE6E1] rounded-full flex items-center justify-center mx-auto text-[#8C827A]">
              <Search className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-serif text-xl font-medium text-boutique-charcoal">
                No dresses found
              </p>
              <p className="text-xs text-[#8C827A] mt-1 max-w-sm mx-auto">
                {searchQueryParam
                  ? `No items match "${searchQueryParam}" in this category.`
                  : 'No dresses are currently available in this category.'}
              </p>
            </div>
            {(searchQueryParam || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchInput('');
                  updateParams({ search: null, category: null, page: null });
                }}
                className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm"
              >
                Clear Filters & View All
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}

        {/* 4. Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-12 pt-6 border-t border-[#EAE6E1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#8C827A]">
              Showing Page <span className="font-semibold text-boutique-charcoal">{currentPage}</span> of{' '}
              <span className="font-semibold text-boutique-charcoal">{totalPages}</span> ({totalProducts} total dresses)
            </p>

            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-[#D5C4B0] bg-white text-boutique-charcoal hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, current, and adjacent pages
                const isCurrent = pageNum === currentPage;
                const isNearCurrent = Math.abs(pageNum - currentPage) <= 1;
                const isEnd = pageNum === 1 || pageNum === totalPages;

                if (!isNearCurrent && !isEnd) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} className="px-1 text-xs text-[#8C827A]">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[36px] h-9 px-2 text-xs font-semibold uppercase transition-colors border ${
                      isCurrent
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-white text-boutique-charcoal border-[#D5C4B0] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-[#D5C4B0] bg-white text-boutique-charcoal hover:bg-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
