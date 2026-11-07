import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Clock, MessageCircle } from 'lucide-react';
import { ProductCard as ProductCardType, Offer } from '../../types';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/storefront/ProductCard';
import { QuickViewModal } from '../../components/storefront/QuickViewModal';

export const OffersPage: React.FC = () => {
  const { storeInfo } = useStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductCardType | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.public.getOffers(),
      api.public.getProducts({ is_on_offer: true, page_size: 30 })
    ])
      .then(([offersData, prodsData]) => {
        if (isMounted) {
          setOffers(offersData);
          setDiscountedProducts(prodsData.items);
        }
      })
      .catch((err) => console.error('Failed to load offers', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const whatsappNumber = storeInfo?.whatsapp_number || '919876543210';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I am interested in inquiring about your active festive sale offers.')}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 text-xs uppercase tracking-luxury font-semibold mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Store Promotions & Discounts</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-boutique-charcoal font-normal">
            Special Offers & Festive Sales
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-3 leading-relaxed">
            Take advantage of exclusive discounts on handcrafted silk sarees, embellished kurtis, and designer dresses. Real-time prices reflect in-store promotions.
          </p>
        </div>

        {/* Active Campaigns Carousels / Cards */}
        {offers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="relative bg-white border border-[#EAE6E1] p-6 sm:p-8 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 bg-[#B86B5A] text-white text-[11px] font-semibold uppercase tracking-wider">
                      {offer.badge_text || `${Math.round(offer.discount_percentage)}% OFF`}
                    </span>
                    {offer.promo_code && (
                      <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#D5C4B0] text-xs font-mono font-bold text-boutique-charcoal">
                        CODE: {offer.promo_code}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl text-boutique-charcoal font-medium mb-2">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-[#6B6B6B] leading-relaxed mb-4">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-[#8C827A]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B86B5A]" />
                    <span>Valid until {new Date(offer.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Claim on WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discounted Products Grid */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6E1] mb-8">
            <h2 className="font-serif text-2xl text-boutique-charcoal font-medium">
              Products on Sale ({discountedProducts.length})
            </h2>
            <span className="text-xs text-[#8C827A] uppercase tracking-wider">
              Prices updated dynamically from store database
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-white animate-pulse border border-[#EAE6E1]" />
              ))}
            </div>
          ) : discountedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#EAE6E1] p-8">
              <p className="font-serif text-xl text-boutique-charcoal mb-2">No discounted items currently</p>
              <p className="text-xs text-[#8C827A]">Check back soon for seasonal festive sales.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {discountedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

