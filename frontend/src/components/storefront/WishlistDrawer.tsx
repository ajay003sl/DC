import React from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, Trash2, MessageCircle, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const { storeInfo } = useStore();

  if (!isOpen) return null;

  const whatsappNumber = (storeInfo?.whatsapp_number || '918925184903').replace(/[^0-9]/g, '');

  const handleSendWishlistToWhatsApp = () => {
    if (wishlist.length === 0) return;

    let itemsText = wishlist.map((item, idx) => (
      `${idx + 1}. *${item.name}* (SKU: ${item.sku}) - ${formatPrice(item.effective_price)}`
    )).join('\n');

    const message = `Hello Jershiha Fashion! ✨\n\nI have shortlisted these ${wishlist.length} dresses from your website for my upcoming physical boutique visit:\n\n${itemsText}\n\nPlease let me know if these are currently available in the Bangalore store for me to try on. Thank you!`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#EAE6E1] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <h3 className="font-serif text-xl font-medium text-boutique-charcoal">
              Saved for Store Trial ({wishlist.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C827A] hover:text-black transition-colors"
            aria-label="Close saved items"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-serif text-lg text-boutique-charcoal">Your shortlist is empty</p>
              <p className="text-xs text-[#8C827A] max-w-xs mx-auto">
                Tap the heart icon on any dress while browsing to save it for your visit to our boutique!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-wider font-semibold"
              >
                Browse Dresses
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs text-[#8C827A] pb-2 border-b border-[#F0ECE1]">
                <span>Items saved on this device</span>
                <button
                  onClick={clearWishlist}
                  className="text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-2.5 bg-[#FAF7F2] border border-[#EAE6E1] items-center"
                  >
                    <img
                      src={item.primary_image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80'}
                      alt={item.name}
                      className="w-16 h-20 object-cover border border-[#EAE6E1] bg-white flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-[#8C827A] truncate font-medium">
                        {item.category_name}
                      </p>
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={onClose}
                        className="font-serif text-sm font-medium text-boutique-charcoal hover:text-[#B86B5A] truncate block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                        {formatPrice(item.effective_price)}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleWishlist(item)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from saved items"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {wishlist.length > 0 && (
          <div className="p-5 border-t border-[#EAE6E1] bg-[#FDFBF7] space-y-2.5">
            <button
              onClick={handleSendWishlistToWhatsApp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-luxury font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send Shortlist on WhatsApp</span>
            </button>

            <p className="text-[10px] text-center text-[#8C827A]">
              Our in-store stylist will verify stock and prepare your selected pieces for in-store trial.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

