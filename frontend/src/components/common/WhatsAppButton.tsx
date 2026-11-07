import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/format';
import { useStore } from '../../context/StoreContext';

interface WhatsAppButtonProps {
  productName: string;
  sku: string;
  size?: string;
  colour?: string;
  price: number;
  className?: string;
  variant?: 'primary' | 'secondary' | 'pill';
  label?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  sku,
  size = 'Not specified',
  colour = 'Not specified',
  price,
  className = '',
  variant = 'primary',
  label = 'Enquire on WhatsApp'
}) => {
  const { storeInfo } = useStore();

  const handleEnquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = buildWhatsAppUrl({
      productName,
      sku,
      size,
      colour,
      price,
      phone: storeInfo?.whatsapp_number,
      storeName: storeInfo?.store_name
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={handleEnquiry}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all ${className}`}
      >
        <MessageCircle className="w-3.5 h-3.5 fill-white" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleEnquiry}
        className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-xs tracking-luxury uppercase font-medium border border-emerald-600 text-emerald-800 hover:bg-emerald-50 transition-colors ${className}`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleEnquiry}
      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs tracking-luxury uppercase font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] ${className}`}
    >
      <MessageCircle className="w-4 h-4 fill-white" />
      <span>{label}</span>
    </button>
  );
};

