import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Check, MapPin, ShieldCheck, Ruler, ArrowLeft, Share2 } from 'lucide-react';
import { ProductDetail as ProductDetailType, ProductCard as ProductCardType, ProductVariant } from '../../types';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { ImageZoom } from '../../components/common/ImageZoom';
import { WhatsAppButton } from '../../components/common/WhatsAppButton';
import { ProductCard } from '../../components/storefront/ProductCard';
import { SizeGuideModal } from '../../components/common/SizeGuideModal';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [related, setRelated] = useState<ProductCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api.public.getProductDetail(slug)
      .then((data) => {
        setProduct(data);
        if (data.available_sizes.length > 0) {
          setSelectedSize(data.available_sizes[0]);
        }
        if (data.available_colours.length > 0) {
          setSelectedColour(data.available_colours[0]);
        }

        // Fetch related products
        api.public.getRelatedProducts(slug, 4)
          .then((rel) => setRelated(rel))
          .catch((e) => console.error(e));
      })
      .catch((err) => console.error('Failed to load product', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-white border border-[#EAE6E1]" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200" />
            <div className="h-10 w-3/4 bg-gray-200" />
            <div className="h-8 w-40 bg-gray-200" />
            <div className="h-28 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] py-20 text-center px-4">
        <h2 className="font-serif text-3xl text-boutique-charcoal mb-4">Product Not Found</h2>
        <p className="text-sm text-[#8C827A] mb-8">This design may have been archived or removed from the catalog.</p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-luxury hover:bg-black inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ image_url: product.primary_image_url, is_primary: true, display_order: 0 }];
  const currentImageUrl = images[selectedImageIndex]?.image_url || product.primary_image_url;

  // Determine variant stock for current selection
  const matchingVariant = product.variants.find(
    v => (selectedSize ? v.size === selectedSize : true) &&
         (selectedColour ? v.colour === selectedColour : true)
  );

  const stockQuantity = matchingVariant ? matchingVariant.stock_quantity : product.total_stock;
  const isOutOfStock = stockQuantity === 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#8C827A] uppercase tracking-wider mb-8">
          <Link to="/" className="hover:text-boutique-charcoal">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-boutique-charcoal">Dresses</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-boutique-charcoal">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-boutique-charcoal font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Gallery Column (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails vertical stack on desktop */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] flex-shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border-2 overflow-hidden transition-all ${
                      selectedImageIndex === idx
                        ? 'border-boutique-charcoal shadow-sm'
                        : 'border-[#EAE6E1] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Interactive Zoom Display */}
            <div className="flex-1 relative bg-white border border-[#EAE6E1]">
              <ImageZoom
                src={currentImageUrl}
                alt={product.name}
                className="w-full aspect-[3/4]"
              />

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.is_on_offer && product.discount_percentage > 0 && (
                  <span className="px-3 py-1 bg-[#B86B5A] text-white text-xs uppercase tracking-luxury font-semibold shadow">
                    {product.offer_label || `${Math.round(product.discount_percentage)}% OFF`}
                  </span>
                )}
                {product.is_new_arrival && (
                  <span className="px-3 py-1 bg-[#1A1A1A] text-white text-xs uppercase tracking-luxury font-semibold flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>New Arrival</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Info & Action Column (5 cols on desktop) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs uppercase tracking-luxury text-[#8C827A] mb-2 font-medium">
                <span>{product.category_name || 'Boutique Collection'}</span>
                <span>SKU: {product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl text-boutique-charcoal font-medium leading-tight mb-4">
                {product.name}
              </h1>

              {/* Price display */}
              <div className="flex items-baseline gap-3 pb-6 border-b border-[#EAE6E1]">
                <span className="text-3xl font-semibold text-[#1A1A1A]">
                  {formatPrice(product.effective_price)}
                </span>
                {product.discounted_price && product.discounted_price < product.original_price && (
                  <span className="text-lg text-[#8C827A] line-through">
                    {formatPrice(product.original_price)}
                  </span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="px-2.5 py-1 text-xs bg-red-100 text-red-700 font-semibold uppercase">
                    Save {Math.round(product.discount_percentage)}%
                  </span>
                )}
              </div>

              {/* Size Selector */}
              {product.available_sizes.length > 0 && (
                <div className="my-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-widest text-boutique-charcoal font-semibold">
                      Select Size: <span className="text-[#B86B5A]">{selectedSize}</span>
                    </span>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-[11px] text-[#8C827A] hover:text-black flex items-center gap-1 underline cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {product.available_sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] h-11 px-4 text-xs font-semibold uppercase border transition-all ${
                            isSelected
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                              : 'bg-white text-boutique-charcoal border-[#D5C4B0] hover:border-boutique-charcoal'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colour Selector */}
              {product.available_colours.length > 0 && (
                <div className="my-6">
                  <span className="block text-xs uppercase tracking-widest text-boutique-charcoal font-semibold mb-2">
                    Select Colour: <span className="text-[#B86B5A]">{selectedColour}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.available_colours.map((col) => {
                      const isSelected = selectedColour === col;
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColour(col)}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs border transition-all ${
                            isSelected
                              ? 'border-boutique-charcoal bg-[#1A1A1A] text-white font-semibold shadow-sm'
                              : 'border-[#D5C4B0] bg-white text-boutique-charcoal hover:border-boutique-charcoal'
                          }`}
                        >
                          <span>{col}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Physical Store Stock Indicator */}
              <div className="my-6 p-4 bg-white border border-[#EAE6E1]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-red-500' : stockQuantity <= 3 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                  <div>
                    {isOutOfStock ? (
                      <p className="text-xs font-semibold text-red-700">
                        Sold Out in Physical Store for size {selectedSize} ({selectedColour})
                      </p>
                    ) : stockQuantity <= 3 ? (
                      <p className="text-xs font-semibold text-amber-800">
                        Low Stock Alert: Only {stockQuantity} piece{stockQuantity > 1 ? 's' : ''} left in our Bangalore boutique!
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-emerald-800">
                        In Stock & Ready for In-Store Trial or Immediate WhatsApp Order
                      </p>
                    )}
                    <p className="text-[11px] text-[#8C827A] mt-0.5">
                      Reserve this dress directly via WhatsApp before it sells out in-store.
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary WhatsApp Action Button */}
              <div className="space-y-3 pt-2">
                <WhatsAppButton
                  productName={product.name}
                  sku={product.sku}
                  size={selectedSize}
                  colour={selectedColour}
                  price={product.effective_price}
                  className="w-full justify-center !py-4 text-sm"
                  label="Enquire & Order on WhatsApp"
                />

                <button
                  onClick={handleShare}
                  className="w-full py-2.5 bg-white border border-[#D5C4B0] text-xs uppercase tracking-wider font-medium text-boutique-charcoal hover:bg-[#FAF7F2] flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Product Link'}</span>
                </button>
              </div>

              {/* In-Store Assurances */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#EAE6E1] text-xs text-[#6B6B6B]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#B86B5A] flex-shrink-0 mt-0.5" />
                  <span>Try it on at our Indiranagar, Bangalore boutique.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
                  <span>Complimentary in-store fitting & hem adjustments.</span>
                </div>
              </div>
            </div>

            {/* Description & Care accordion */}
            <div className="pt-6 border-t border-[#EAE6E1] space-y-4">
              <div>
                <h3 className="text-xs uppercase tracking-luxury text-boutique-charcoal font-semibold mb-2">
                  Design & Fabric Narrative
                </h3>
                <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed whitespace-pre-line">
                  {product.description || 'Exclusively crafted women\'s fashion piece tailored with premium artisanal craftsmanship.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="pt-16 border-t border-[#EAE6E1]">
            <div className="text-center max-w-xl mx-auto mb-10">
              <p className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-1">
                You May Also Admire
              </p>
              <h2 className="font-serif text-3xl text-boutique-charcoal font-normal">
                Complementary Silhouettes
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#EAE6E1] p-3 px-4 z-40 shadow-2xl flex items-center justify-between gap-3 animate-slideUp">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-base font-bold text-[#1A1A1A]">
              {formatPrice(product.effective_price)}
            </span>
            {product.discounted_price && product.discounted_price < product.original_price && (
              <span className="text-[11px] text-[#8C827A] line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#8C827A] truncate">
            Size: <span className="font-bold text-black">{selectedSize || 'Choose'}</span> • {selectedColour}
          </p>
        </div>

        <WhatsAppButton
          productName={product.name}
          sku={product.sku}
          size={selectedSize}
          colour={selectedColour}
          price={product.effective_price}
          className="flex-1 justify-center !py-3 !text-xs !tracking-wider"
          label="WhatsApp Order"
        />
      </div>

      {/* Luxury Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
};

