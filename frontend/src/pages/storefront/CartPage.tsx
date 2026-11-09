import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, MessageCircle, ArrowLeft, Sparkles, ShieldCheck, MapPin, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/format';

export const CartPage: React.FC = () => {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { storeInfo } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

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
    <div className="min-h-screen bg-[#FDFBF7] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAE6E1]">
          <nav className="flex items-center gap-2 text-xs text-[#8C827A] uppercase tracking-wider">
            <Link to="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-[#1A1A1A] font-semibold">Shopping Bag</span>
          </nav>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#7A5835] hover:text-black font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8 flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide text-[#1A1A1A]">
              Your Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-[#736B63] mt-1 font-light">
              Review your selected pieces and place your direct boutique order via WhatsApp.
            </p>
          </div>
          {totalCount > 0 && (
            <span className="px-3 py-1 bg-white border border-[#D5C4B0] text-xs font-semibold uppercase tracking-wider text-[#7A5835]">
              {totalCount} {totalCount === 1 ? 'Piece' : 'Pieces'} Selected
            </span>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="bg-white border border-[#EAE6E1] p-10 sm:p-16 text-center max-w-2xl mx-auto my-8 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border border-[#EAE6E1] flex items-center justify-center mx-auto mb-4 text-[#7A5835]">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-[#1A1A1A] mb-2">
              Your Shopping Bag is Currently Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#8C827A] max-w-md mx-auto mb-6 font-light">
              Explore our boutique collection of handpicked women's dresses and exclusive designer wear. Check live designs and add them to your bag.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-[0.16em] font-medium shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Explore Boutique Collections</span>
            </Link>
          </div>
        ) : (
          /* Bag With Items */
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            
            {/* Left Column: Items Table / List (8 cols) */}
            <div className="lg:col-span-8 space-y-4 mb-8 lg:mb-0">
              <div className="bg-white border border-[#EAE6E1] shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-[#F0ECE1] flex items-center justify-between bg-[#FAF7F2]">
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">
                    Selected Designs ({totalCount})
                  </span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-xs text-[#8C827A] hover:text-red-700 transition-colors uppercase tracking-wider font-medium"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-[#F0ECE1]">
                  {items.map((item) => {
                    const hasColour = item.colour && !['standard', 'default', 'none', 'n/a', ''].includes(item.colour.trim().toLowerCase());
                    return (
                      <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-[#FAF7F2]/40 transition-colors">
                        
                        {/* Thumbnail */}
                        <Link to={`/product/${item.slug}`} className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 bg-[#FAF7F2] border border-[#EAE6E1] overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-base sm:text-lg font-medium text-[#1A1A1A] hover:text-[#7A5835] transition-colors leading-snug">
                            <Link to={`/product/${item.slug}`}>
                              {item.name}
                            </Link>
                          </h3>

                          <p className="text-[10px] text-[#8C827A] uppercase tracking-wider mt-0.5">
                            SKU: {item.sku}
                          </p>

                          {/* Size & Colour Badges */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#EAE6E1] text-[10px] font-semibold text-[#1A1A1A]">
                              Size: {item.size}
                            </span>
                            {hasColour && (
                              <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#EAE6E1] text-[10px] font-semibold text-[#7A5835]">
                                Colour: {item.colour}
                              </span>
                            )}
                          </div>

                          {/* Unit price on mobile */}
                          <div className="mt-2 text-xs font-semibold text-[#1A1A1A] sm:hidden">
                            {formatPrice(item.price)} each
                          </div>
                        </div>

                        {/* Quantity Stepper & Subtotal */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-[#F0ECE1]">
                          <div className="flex items-center border border-[#D5C4B0] bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-[#5A524C] hover:bg-[#FAF7F2] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-9 text-center text-xs font-bold text-[#1A1A1A]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                              className="w-8 h-8 flex items-center justify-center text-[#5A524C] hover:bg-[#FAF7F2] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right">
                            <span className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A] block">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-[10px] uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors inline-flex items-center gap-1 mt-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Return Action */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#7A5835] hover:text-black font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Continue Browsing Dresses</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary & WhatsApp Checkout (4 cols) */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white border border-[#EAE6E1] p-5 sm:p-6 shadow-2xs space-y-5">
                <h2 className="font-serif text-xl text-[#1A1A1A] font-medium pb-3 border-b border-[#EAE6E1]">
                  Order Summary
                </h2>

                {/* Subtotals */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#736B63]">
                    <span>Items Total ({totalCount} pcs)</span>
                    <span className="font-medium text-[#1A1A1A]">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#736B63]">
                    <span>Boutique Shipping</span>
                    <span className="text-emerald-800 font-semibold uppercase tracking-wider text-[11px]">
                      Complimentary
                    </span>
                  </div>
                  <div className="pt-3 border-t border-[#F0ECE1] flex justify-between items-baseline">
                    <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                      Grand Total
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Direct WhatsApp Ordering Form */}
                <div className="pt-3 border-t border-[#F0ECE1] space-y-3">
                  <p className="text-[11px] uppercase tracking-wider text-[#8C827A] font-semibold">
                    Customer Details (Optional):
                  </p>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name (optional)"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D5C4B0] placeholder-[#9C948B] focus:outline-none focus:border-[#1A1A1A]"
                  />

                  <textarea
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery Address / City (optional)"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#D5C4B0] placeholder-[#9C948B] focus:outline-none focus:border-[#1A1A1A]"
                  />

                  {/* Primary WhatsApp Checkout Button */}
                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-3.5 px-4 bg-[#1E3F20] hover:bg-black text-white text-xs uppercase tracking-[0.16em] font-medium flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#1E3F20]" />
                    <span>Order via WhatsApp ({formatPrice(totalPrice)})</span>
                  </button>

                  <p className="text-[10px] text-center text-[#8C827A] font-light leading-relaxed">
                    Clicking opens WhatsApp with your itemized bag ready to confirm availability and pay via UPI, GPay, or NetBanking.
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-[#F0ECE1] space-y-2 text-[11px] text-[#5A524C]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span>100% Verified Boutique Designs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-[#7A5835] flex-shrink-0" />
                    <span>In-Store Try-On & Pickup in Bangalore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                    <span>Custom Sleeve & Fit Alterations Available</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
