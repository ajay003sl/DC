import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Check, ArrowRight, ShoppingBag } from 'lucide-react';
import { ProductCard, ProductDetail, ProductVariant } from '../../types';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { useCart } from '../../context/CartContext';

interface QuickViewModalProps {
  product: ProductCard | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');

  useEffect(() => {
    if (product) {
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
  }, [product]);

  useEffect(() => {
    if (!product) return;

    let isMounted = true;
    setLoading(true);

    api.public.getProductDetail(product.id)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          // Set initial defaults
          if (data.available_sizes.length > 0) {
            setSelectedSize(data.available_sizes[0]);
          }
          if (data.available_colours.length > 0) {
            setSelectedColour(data.available_colours[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load quick view details', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [product]);

  if (!product) return null;

  const currentVariants: ProductVariant[] = detail?.variants || [];
  
  // Calculate stock for selected combination
  const matchingVariant = currentVariants.find(
    v => (selectedSize ? v.size === selectedSize : true) && 
         (selectedColour ? v.colour === selectedColour : true)
  );

  const variantStock = matchingVariant ? matchingVariant.stock_quantity : (detail?.total_stock ?? product.total_stock);
  const images = (detail?.images && detail.images.length > 0) ? detail.images : product.images;
  const currentImageUrl = images[activeImageIndex]?.image_url || product.primary_image_url;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EAE6E1] rounded-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-boutique-charcoal rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="p-6 bg-[#FDFBF7] flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] bg-[#F5F2EB] overflow-hidden mb-3">
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 flex-shrink-0 border-2 overflow-hidden ${
                      activeImageIndex === idx ? 'border-boutique-charcoal' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-luxury text-[#8C827A] mb-1 font-medium">
                {product.category_name || 'Women\'s Collection'} • SKU: {product.sku}
              </p>

              <h2 className="font-serif text-2xl md:text-3xl text-boutique-charcoal font-medium leading-tight mb-3">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-semibold text-[#1A1A1A]">
                  {formatPrice(product.effective_price)}
                </span>
                {product.discounted_price && product.discounted_price < product.original_price && (
                  <span className="text-base text-[#8C827A] line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 font-semibold uppercase">
                    {Math.round(product.discount_percentage)}% OFF
                  </span>
                )}
              </div>

              {/* Short description */}
              {detail?.description && (
                <p className="text-xs text-[#6B6B6B] leading-relaxed mb-6 line-clamp-3">
                  {detail.description}
                </p>
              )}

              {/* Size Selector */}
              {product.available_sizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs uppercase tracking-widest text-boutique-charcoal font-medium">
                      Select Size: <span className="font-bold">{selectedSize}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.available_sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[40px] px-3 py-1.5 text-xs font-medium uppercase border transition-all ${
                          selectedSize === size
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-white text-boutique-charcoal border-[#D5C4B0] hover:border-boutique-charcoal'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colour Selector */}
              {product.available_colours.length > 0 && (
                <div className="mb-6">
                  <span className="block text-xs uppercase tracking-widest text-boutique-charcoal font-medium mb-1.5">
                    Select Colour: <span className="font-bold">{selectedColour}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.available_colours.map((col) => {
                      const isSelected = selectedColour === col;
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColour(col)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all ${
                            isSelected
                              ? 'border-boutique-charcoal bg-[#1A1A1A] text-white font-semibold'
                              : 'border-[#EAE6E1] bg-white text-boutique-charcoal hover:border-[#D5C4B0]'
                          }`}
                        >
                          <span>{col}</span>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* In-store stock availability message */}
              <div className="mb-6 py-2 px-3 bg-[#FAF7F2] border border-[#EAE6E1] text-xs">
                {variantStock === 0 ? (
                  <span className="text-red-700 font-medium">
                    ⚠️ Currently out of stock in physical store for selected option.
                  </span>
                ) : variantStock <= 3 ? (
                  <span className="text-amber-800 font-medium">
                    ⚡ Hurry! Only {variantStock} pieces left in our store for this size.
                  </span>
                ) : (
                  <span className="text-emerald-800 font-medium">
                    ✓ Available in stock at our Bangalore boutique.
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-4 border-t border-[#EAE6E1]">
              <button
                type="button"
                onClick={() => {
                  if (!product || variantStock === 0) return;
                  addItem({
                    productId: product.id,
                    name: product.name,
                    sku: product.sku,
                    slug: product.slug,
                    price: product.effective_price,
                    imageUrl: currentImageUrl,
                    size: selectedSize || (detail?.available_sizes?.[0] || 'Standard'),
                    colour: selectedColour || (detail?.available_colours?.[0] || 'Default'),
                    quantity: 1,
                    maxStock: variantStock > 0 ? variantStock : undefined
                  });
                  onClose();
                }}
                disabled={variantStock === 0}
                className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs tracking-luxury uppercase font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{variantStock === 0 ? 'Sold Out' : 'Add to Shopping Bag'}</span>
              </button>

              <WhatsAppButton
                productName={product.name}
                sku={product.sku}
                size={selectedSize}
                colour={selectedColour}
                price={product.effective_price}
                className="w-full justify-center !py-3 text-xs"
                label="Buy Now via WhatsApp"
              />

              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="w-full py-2 text-center text-xs tracking-widest uppercase font-medium text-boutique-charcoal hover:text-boutique-terracotta transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full Product Details & Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

