import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { ProductCard as ProductCardType } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { QuickViewModal } from '../../components/storefront/QuickViewModal';

export const HomePage: React.FC = () => {
  const { categories, storeInfo } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState<ProductCardType[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductCardType[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.public.getFeaturedCollections()
      .then((data) => {
        if (isMounted) {
          setFeaturedProducts(data.featured);
          setNewArrivals(data.new_arrivals);
        }
      })
      .catch((err) => console.error('Failed to load home collections', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const whatsappNumber = storeInfo?.whatsapp_number || '918925184903';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I would like to book a personal styling visit at your boutique.')}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* 1. Hero Banner */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Background Fashion Imagery with Dark Elegant Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80"
            alt="Women's Haute Couture Fashion"
            className="w-full h-full object-cover object-center opacity-40 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-black/40 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5D3B3] text-xs uppercase tracking-luxury mb-6 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Spring & Festive Collection 2026</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-[0.08em] leading-tight mb-6">
            Everyday Style & Grace, <br />
            <span className="italic font-light">Handpicked for You.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#EAE6E1] font-light leading-relaxed mb-10 tracking-wide">
            Explore our physical store's collection of readymade kurtis, sarees, comfortable western wear, and custom-fit dresses. Browse live stock or connect directly on WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#1A1A1A] hover:bg-[#FAF7F2] text-xs uppercase tracking-luxury font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs uppercase tracking-luxury font-semibold backdrop-blur-md transition-all duration-300 border border-emerald-500/50 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Store Enquiry</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Boutique Values / Physical Store Highlights */}
      <section className="py-10 bg-white border-b border-[#EAE6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 p-4 border border-[#F2ECE1] md:border-none">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#B86B5A] flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-boutique-charcoal font-medium">Physical Store Experience</h4>
                <p className="text-xs text-[#8C827A] mt-0.5">Visit our shop to check fabrics, try on clothes & get custom fitting.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-[#F2ECE1] md:border-none">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-emerald-700 flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-boutique-charcoal font-medium">Direct WhatsApp Help</h4>
                <p className="text-xs text-[#8C827A] mt-0.5">Check real-time stock, reserve sizes, or ask for photos before visiting.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-[#F2ECE1] md:border-none">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#C5A880] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg text-boutique-charcoal font-medium">Custom Fitting & Quality</h4>
                <p className="text-xs text-[#8C827A] mt-0.5">We offer size alterations and customisation so every dress fits comfortably.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Showcase Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-2">Curated Silhouettes</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-boutique-charcoal font-normal">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-[#F5F2EB] border border-[#EAE6E1]"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors" />
              
              <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-white group-hover:text-[#E5D3B3] transition-colors">
                  {cat.name}
                </h3>
                {cat.product_count !== undefined && (
                  <p className="text-[11px] tracking-luxury uppercase text-[#EAE6E1]/80 mt-1">
                    {cat.product_count} Designs Available
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. New Arrivals Section */}
      <section className="py-16 bg-[#FAF7F2] border-y border-[#EAE6E1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 pb-4 border-b border-[#EAE6E1]">
            <div>
              <p className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-1">Just Unpacked in Store</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-boutique-charcoal font-normal">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort_by=latest"
              className="mt-4 sm:mt-0 text-xs uppercase tracking-luxury font-medium text-boutique-charcoal hover:text-boutique-terracotta transition-colors flex items-center gap-1.5"
            >
              <span>View All New Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-[#EAE6E1]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Featured Dresses Collection */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 pb-4 border-b border-[#EAE6E1]">
          <div>
            <p className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-1">Editor's Curation</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-boutique-charcoal font-normal">
              Featured Dresses & Silhouettes
            </h2>
          </div>
          <Link
            to="/shop"
            className="mt-4 sm:mt-0 text-xs uppercase tracking-luxury font-medium text-boutique-charcoal hover:text-boutique-terracotta transition-colors flex items-center gap-1.5"
          >
            <span>View Complete Store Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 6. Store Visit & Physical Boutique Invitation */}
      <section className="py-16 bg-[#F2ECE1] border-t border-[#EAE6E1]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="font-serif text-2xl sm:text-3xl tracking-widest uppercase text-boutique-charcoal">
            Visit Our Boutique Store
          </span>
          <p className="text-sm text-[#6B6B6B] max-w-xl mx-auto mt-3 mb-6">
            Feel the pure silks, get measured for custom sleeve and hem adjustments, or consult directly with our in-house fashion stylists.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-boutique-charcoal font-medium">
            <span className="flex items-center gap-1.5 max-w-md">
              <MapPin className="w-4 h-4 text-[#B86B5A] flex-shrink-0" />
              <span className="truncate">{storeInfo?.address || 'Indiranagar, Bangalore'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#B86B5A] flex-shrink-0" />
              <span>{storeInfo?.hours || 'Mon - Sun: 10:00 AM - 9:00 PM'}</span>
            </span>
          </div>
          <div className="mt-8">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-medium transition-colors shadow-md"
            >
              <span>Get Directions & Store Hours</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

