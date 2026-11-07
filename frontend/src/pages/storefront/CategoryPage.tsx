import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ProductCard as ProductCardType, Category, ProductListResponse } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { QuickViewModal } from '../../components/storefront/QuickViewModal';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories } = useStore();
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardType | null>(null);

  const currentCategory = categories.find((c) => c.slug === slug);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api.public.getProducts({ category_slug: slug, page_size: 24 })
      .then((res: ProductListResponse) => {
        setProducts(res.items);
      })
      .catch((err) => console.error('Failed to load category products', err))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8C827A] uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black">Collections</Link>
          <span>/</span>
          <span className="text-boutique-charcoal font-semibold">{currentCategory?.name || slug}</span>
        </div>

        {/* Category Editorial Header Banner */}
        <div className="relative mb-12 p-8 sm:p-12 bg-white border border-[#EAE6E1] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl z-10">
            <span className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-2 block">
              Boutique Curation
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-boutique-charcoal font-normal mb-4">
              {currentCategory?.name || slug}
            </h1>
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-6">
              {currentCategory?.description || 'Browse handcrafted designs and tailored silhouettes from our physical store.'}
            </p>
            <p className="text-xs tracking-wider uppercase text-[#8C827A] font-medium">
              Showing {products.length} exclusive designs
            </p>
          </div>

          {currentCategory?.image_url && (
            <div className="w-full md:w-72 aspect-[4/3] overflow-hidden border border-[#EAE6E1] flex-shrink-0 shadow-md">
              <img
                src={currentCategory.image_url}
                alt={currentCategory.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-[#EAE6E1]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#EAE6E1] p-8">
            <p className="font-serif text-2xl text-boutique-charcoal mb-2">No items currently available in this category</p>
            <p className="text-xs text-[#8C827A] mb-6">New styles are being unpacked in our physical store regularly.</p>
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-luxury inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Dresses</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

