import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageCircle, Sparkles, ShoppingBag, Check } from 'lucide-react';
import { ProductCard as ProductCardType } from '../../types';
import { formatPrice, buildWhatsAppUrl } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: ProductCardType;
  onQuickView?: (product: ProductCardType) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { storeInfo } = useStore();

  const primaryImage = product.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images.length > 1 ? product.images[1].image_url : primaryImage;

  const isOutOfStock = product.total_stock === 0;
  const isLowStock = product.total_stock > 0 && product.total_stock <= 3;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      price: product.effective_price,
      imageUrl: primaryImage,
      size: product.available_sizes?.[0] || 'Free Size',
      colour: product.available_colours?.[0] || 'Standard',
      quantity: 1,
      maxStock: product.total_stock > 0 ? product.total_stock : undefined,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWhatsAppEnquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = buildWhatsAppUrl({
      productName: product.name,
      sku: product.sku,
      size: product.available_sizes?.[0] || 'Standard',
      colour: product.available_colours?.[0] || 'Standard',
      price: product.effective_price,
      phone: storeInfo?.whatsapp_number,
      storeName: storeInfo?.store_name
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="group relative flex flex-col bg-white border border-[#EAE6E1] overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#D5C4B0]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F2EB]">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges container */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.is_on_offer && product.discount_percentage > 0 && (
            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-[#B86B5A] text-white shadow-sm">
              {product.offer_label || `${Math.round(product.discount_percentage)}% OFF`}
            </span>
          )}

          {product.is_new_arrival && (
            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] tracking-wider uppercase font-bold bg-[#1A1A1A] text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
              <span>New</span>
            </span>
          )}
        </div>

        {/* Stock overlays */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
            <span className="px-2.5 py-1 bg-[#1A1A1A] text-white text-[9px] sm:text-[11px] tracking-wider uppercase font-bold">
              Sold Out
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[9px] sm:text-[10px] tracking-wider font-semibold">
              Only {product.total_stock} left
            </span>
          </div>
        ) : null}

        {/* Quick actions hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-1.5 sm:py-2 px-2 bg-white text-boutique-charcoal hover:bg-[#FAF7F2] text-[10px] sm:text-[11px] uppercase tracking-wider font-medium flex items-center justify-center gap-1 shadow transition-colors"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Quick View</span>
              <span className="sm:hidden">View</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleWhatsAppEnquiry}
            className="px-2.5 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-medium flex items-center justify-center gap-1 shadow transition-colors"
            title="Enquire via WhatsApp"
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Enquire</span>
          </button>
        </div>
      </div>

      {/* Details container */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category */}
          {product.category_name && (
            <p className="text-[10px] sm:text-[11px] tracking-luxury uppercase text-[#8C827A] mb-0.5 sm:mb-1 font-medium truncate">
              {product.category_name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-serif text-sm sm:text-base font-medium text-boutique-charcoal leading-snug line-clamp-2 hover:text-boutique-terracotta transition-colors mb-1.5 sm:mb-2">
            <Link to={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-[#1A1A1A]">
              {formatPrice(product.effective_price)}
            </span>
            {product.discounted_price && product.discounted_price < product.original_price && (
              <span className="text-[10px] sm:text-xs text-[#8C827A] line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Available Sizes preview */}
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-[#F2ECE1]">
              <span className="text-[9px] text-[#8C827A] uppercase tracking-wider mr-0.5">Sizes:</span>
              {product.available_sizes.slice(0, 4).map((s) => (
                <span
                  key={s}
                  className="px-1 py-0.2 text-[8px] sm:text-[9px] bg-[#FAF7F2] border border-[#EAE6E1] text-boutique-charcoal font-medium"
                >
                  {s}
                </span>
              ))}
              {product.available_sizes.length > 4 && (
                <span className="text-[8px] text-[#8C827A]">+{product.available_sizes.length - 4}</span>
              )}
            </div>
          )}

          {/* Luxury Action Bar: Add to Bag + WhatsApp */}
          <div className="mt-3 pt-2.5 border-t border-[#F0ECE1] flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className={`flex-1 h-9 px-2 text-[10px] sm:text-xs uppercase tracking-[0.14em] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 border ${
                added
                  ? 'bg-[#1E3F20] text-white border-[#1E3F20]'
                  : 'bg-[#1A1A1A] hover:bg-black text-white border-[#1A1A1A] active:scale-[0.98]'
              } disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs rounded-none`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span className="truncate">{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleWhatsAppEnquiry}
              className="h-9 px-2.5 sm:px-3 bg-white hover:bg-[#FAF7F2] border border-[#D5C4B0] hover:border-[#1A1A1A] text-emerald-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs rounded-none flex-shrink-0"
              title="Enquire or Order via WhatsApp"
              aria-label="Enquire via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-800/15 text-emerald-800" />
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-semibold text-emerald-900">
                WhatsApp
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

