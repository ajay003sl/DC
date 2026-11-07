import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ChevronDown, RefreshCw, Search } from 'lucide-react';
import { ProductCard as ProductCardType, Category, ProductListResponse } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { QuickViewModal } from '../../components/storefront/QuickViewModal';
import { formatPrice } from '../../utils/format';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useStore();

  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardType | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states initialized from URL params
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort_by') || 'latest');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get('sizes') ? searchParams.get('sizes')!.split(',') : []
  );
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max_price') || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get('in_stock') === 'true');
  const [onOfferOnly, setOnOfferOnly] = useState<boolean>(searchParams.get('on_offer') === 'true');

  const availableSizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  // Sync state with URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (sortBy !== 'latest') params.set('sort_by', sortBy);
    if (selectedSizes.length > 0) params.set('sizes', selectedSizes.join(','));
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (inStockOnly) params.set('in_stock', 'true');
    if (onOfferOnly) params.set('on_offer', 'true');

    setSearchParams(params, { replace: true });
  }, [page, selectedCategory, searchQuery, sortBy, selectedSizes, minPrice, maxPrice, inStockOnly, onOfferOnly]);

  // Fetch products
  const fetchProducts = () => {
    setLoading(true);
    api.public.getProducts({
      page,
      page_size: 12,
      category_slug: selectedCategory || undefined,
      search: searchQuery.trim() || undefined,
      sort_by: sortBy,
      sizes: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      is_on_offer: onOfferOnly ? true : undefined,
      in_stock_only: inStockOnly,
    })
      .then((res: ProductListResponse) => {
        setProducts(res.items);
        setTotalProducts(res.total);
        setTotalPages(res.total_pages);
      })
      .catch((err) => console.error('Failed to fetch products', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, searchQuery, sortBy, selectedSizes, minPrice, maxPrice, inStockOnly, onOfferOnly]);

  const toggleSize = (size: string) => {
    setPage(1);
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('latest');
    setSelectedSizes([]);
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setOnOfferOnly(false);
    setPage(1);
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    selectedSizes.length +
    (minPrice || maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onOfferOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-[#8C827A] uppercase tracking-wider mb-2">
            <span>Storefront</span>
            <span>/</span>
            <span className="text-boutique-charcoal font-semibold">
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                : 'All Dresses & Couture'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl text-boutique-charcoal font-medium">
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name
                  : 'Boutique Catalog'}
              </h1>
              <p className="text-xs text-[#8C827A] mt-1 tracking-wide">
                Showing {totalProducts} {totalProducts === 1 ? 'dress' : 'dresses'} available in our physical store
              </p>
            </div>

            {/* Sorting & Mobile Filter Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden px-4 py-2 bg-white border border-[#D5C4B0] text-xs uppercase tracking-wider font-medium flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              <div className="flex items-center gap-2 bg-white border border-[#D5C4B0] px-3 py-2 text-xs">
                <span className="text-[#8C827A] uppercase tracking-wider hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer text-boutique-charcoal"
                >
                  <option value="latest">Latest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Filters Sidebar + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 border border-[#EAE6E1] h-fit sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E1]">
              <span className="text-xs uppercase tracking-luxury text-boutique-charcoal font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#B86B5A]" />
                <span>Filter Collection</span>
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-[#B86B5A] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Search within store */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-boutique-charcoal mb-2">
                Search Design / Fabric
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. Silk, Velvet, Chanderi..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                />
                <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-boutique-charcoal mb-2">
                Category
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(1);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors flex justify-between ${
                    selectedCategory === ''
                      ? 'bg-[#1A1A1A] text-white font-medium'
                      : 'text-boutique-charcoal hover:bg-[#FAF7F2]'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setPage(1);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors flex justify-between ${
                      selectedCategory === c.slug
                        ? 'bg-[#1A1A1A] text-white font-medium'
                        : 'text-boutique-charcoal hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>{c.name}</span>
                    {c.product_count !== undefined && (
                      <span className="opacity-70 text-[10px]">({c.product_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-boutique-charcoal mb-2">
                Size Availability
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableSizesList.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-2.5 py-1 text-xs border font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FAF7F2] text-boutique-charcoal border-[#EAE6E1] hover:border-[#C5A880]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-boutique-charcoal mb-2">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-1/2 px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
                />
                <span className="text-[#8C827A]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-1/2 px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-3 border-t border-[#EAE6E1]">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={onOfferOnly}
                  onChange={(e) => {
                    setOnOfferOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-[#D5C4B0] text-[#B86B5A] focus:ring-0"
                />
                <span className="text-boutique-charcoal font-medium">On Sale / Discounted Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-[#D5C4B0] text-[#1A1A1A] focus:ring-0"
                />
                <span className="text-boutique-charcoal font-medium">In Physical Store Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-[#EAE6E1]" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-[#EAE6E1] p-8">
                <p className="font-serif text-2xl text-boutique-charcoal mb-2">No matching dresses found</p>
                <p className="text-xs text-[#8C827A] mb-6">
                  Try adjusting your filters, size selections, or search keywords.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-luxury hover:bg-black transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-[#EAE6E1]">
                    <button
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === 1}
                      className="px-4 py-2 border border-[#D5C4B0] text-xs font-medium uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-9 h-9 text-xs font-medium border ${
                            page === pageNum
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                              : 'bg-white text-boutique-charcoal border-[#D5C4B0] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-[#D5C4B0] text-xs font-medium uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E1]">
              <span className="text-xs uppercase tracking-luxury font-semibold text-boutique-charcoal">
                Filters
              </span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <p className="text-xs uppercase tracking-wider font-medium mb-2">Category</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setMobileFilterOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded ${
                    selectedCategory === '' ? 'bg-[#1A1A1A] text-white' : 'text-boutique-charcoal'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded ${
                      selectedCategory === c.slug ? 'bg-[#1A1A1A] text-white' : 'text-boutique-charcoal'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Sizes */}
            <div>
              <p className="text-xs uppercase tracking-wider font-medium mb-2">Sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {availableSizesList.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1 text-xs border ${
                      selectedSizes.includes(size)
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#FAF7F2] text-boutique-charcoal border-[#EAE6E1]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Toggles */}
            <div className="space-y-3 pt-3 border-t border-[#EAE6E1]">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={onOfferOnly}
                  onChange={(e) => setOnOfferOnly(e.target.checked)}
                />
                <span>Sale Items Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In-Store Stock Only</span>
              </label>
            </div>

            <div className="pt-6 border-t border-[#EAE6E1] space-y-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#1A1A1A] text-white text-xs uppercase tracking-luxury font-semibold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 text-xs text-[#8C827A] hover:text-black uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

