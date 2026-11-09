import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, clearCart, totalCount, totalPrice } = useCart();
  const { storeInfo } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Lock background scroll on mobile and desktop when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
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
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const whatsappNumber = (storeInfo?.whatsapp_number || '918925184903').replace(/[^0-9]/g, '');
  const brandName = storeInfo?.store_name || 'Jershiha Fashion';

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const itemsSummary = items
      .map((item, idx) => {
        const itemTotal = formatPrice(item.price * item.quantity);
        const hasColour = item.colour && !['standard', 'default', 'none', 'n/a', ''].includes(item.colour.trim().toLowerCase());
        const colourPart = hasColour ? ` | Colour: ${item.colour.trim()}` : '';
        return `${idx + 1}. *${item.name}* (SKU: ${item.sku})\n   • Size: ${item.size}${colourPart}\n   • Qty: ${item.quantity} × ${formatPrice(item.price)} = ${itemTotal}`;
      })
      .join('\n\n');

    let customerInfo = '';
    if (customerName.trim()) {
      customerInfo += `\n👤 *Customer Name:* ${customerName.trim()}`;
    }
    if (deliveryAddress.trim()) {
      customerInfo += `\n📍 *Delivery Address:* ${deliveryAddress.trim()}`;
    }

    const message = `Hello ${brandName}! 🛍️✨\n\nI would like to place an order for the following ${totalCount} item(s) from your boutique:\n\n${itemsSummary}\n\n----------------------------------\n📦 *Total Items:* ${totalCount}\n💰 *Grand Total:* ${formatPrice(totalPrice)}${customerInfo}\n\nPlease confirm availability and share your payment details (UPI / GPay / PhonePe / Bank Transfer) to finalize my order. Thank you!`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn touch-none overscroll-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCart();
      }}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl animate-slideLeft overscroll-contain touch-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE6E1] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-medium text-boutique-charcoal">
                Shopping Bag
              </h3>
              <p className="text-[11px] text-[#8C827A]">
                {totalCount} {totalCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] text-[#8C827A] hover:text-red-700 transition-colors px-2 py-1"
                title="Clear all items"
              >
                Clear Bag
              </button>
            )}
            <button
              onClick={closeCart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-boutique-charcoal bg-[#FAF7F2] border border-[#EAE6E1] hover:bg-[#EAE6E1] transition-colors"
              aria-label="Continue Shopping"
            >
              <span>Continue Shopping</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto overscroll-contain space-y-4 divide-y divide-[#F0ECE1]">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EAE6E1] flex items-center justify-center mx-auto text-[#8C827A]">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="font-serif text-xl text-boutique-charcoal font-medium">Your Shopping Bag is Empty</p>
                <p className="text-xs text-[#8C827A] max-w-xs mx-auto">
                  Browse our handpicked designer dresses and exclusive women's wear to find your perfect fit.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold transition-colors shadow-sm"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Product Items List */}
              <div className="space-y-3.5 pb-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3.5 items-start p-2.5 rounded-sm hover:bg-[#FAF7F2]/50 transition-colors border border-[#F0ECE1] bg-white"
                  >
                    <Link to={`/product/${item.slug}`} onClick={closeCart} className="flex-shrink-0">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="w-16 h-20 sm:w-20 sm:h-24 object-cover border border-[#EAE6E1] bg-[#F5F2EB] shadow-2xs"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="font-serif text-sm font-semibold text-boutique-charcoal hover:text-boutique-terracotta transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-[#8C827A] hover:text-red-700 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] bg-[#FAF7F2] border border-[#EAE6E1] px-1.5 py-0.5 text-boutique-charcoal font-medium">
                            Size: {item.size}
                          </span>
                          <span className="text-[10px] bg-[#FAF7F2] border border-[#EAE6E1] px-1.5 py-0.5 text-boutique-charcoal font-medium">
                            Colour: {item.colour}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F2EB]">
                        {/* Quantity Increment/Decrement */}
                        <div className="flex items-center border border-[#D5C4B0] bg-white rounded-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-[#FAF7F2] text-boutique-charcoal transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-boutique-charcoal select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-[#FAF7F2] text-boutique-charcoal transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-serif text-sm font-semibold text-boutique-charcoal">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-[#8C827A]">
                              {formatPrice(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Details Form (Optional for WhatsApp Order) */}
              <div className="pt-4 space-y-2.5">
                <p className="text-xs uppercase tracking-wider font-semibold text-boutique-charcoal flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Delivery Information (Optional)</span>
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name (e.g. Priya Sharma)"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal placeholder-[#9C948B]"
                  />
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery City & Address / Landmark"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal placeholder-[#9C948B]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer with Subtotal, WhatsApp Checkout & Continue Shopping */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EAE6E1] bg-[#FDFBF7] space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#8C827A]">
                <span>Total Items</span>
                <span>{totalCount} pieces</span>
              </div>
              <div className="flex justify-between text-[#8C827A]">
                <span>Shipping & Dispatch</span>
                <span className="text-emerald-700 font-medium">Confirmed on WhatsApp</span>
              </div>
              <div className="flex justify-between text-base font-serif font-semibold text-boutique-charcoal pt-2 border-t border-[#EAE6E1]">
                <span>Grand Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Primary Action: Place Order via WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs tracking-luxury uppercase font-semibold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Place Order via WhatsApp ({formatPrice(totalPrice)})</span>
            </button>

            {/* Secondary Action: Continue Shopping */}
            <button
              type="button"
              onClick={closeCart}
              className="w-full py-3 bg-white hover:bg-[#FAF7F2] text-boutique-charcoal border border-[#D5C4B0] text-xs uppercase tracking-luxury font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C827A] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct WhatsApp confirmation with store owner</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
