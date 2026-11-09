export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function buildWhatsAppUrl(params: {
  productName: string;
  sku: string;
  size: string;
  colour?: string;
  price: number;
  phone?: string;
  storeName?: string;
}): string {
  const storePhone = (params.phone || '918925184903').replace(/[^0-9]/g, '');
  const brand = params.storeName || 'Jershiha Fashion';

  const hasSpecificColour = params.colour && !['standard', 'default', 'none', 'n/a', ''].includes(params.colour.trim().toLowerCase());
  const colourLine = hasSpecificColour ? `\n🎨 *Colour:* ${params.colour!.trim()}` : '';

  const message = `Hello ${brand}! ✨\n\nI am interested in enquiring about this product from your boutique store:\n\n👗 *Product:* ${params.productName}\n🏷️ *SKU:* ${params.sku}\n📏 *Size:* ${params.size}${colourLine}\n💰 *Price:* ${formatPrice(params.price)}\n\nPlease let me know if this is currently available in your store or if I can visit to try it on. Thank you!`;

  return `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`;
}

