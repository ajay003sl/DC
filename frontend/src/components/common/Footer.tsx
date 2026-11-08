import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeInfo } = useStore();

  const storeAddress = storeInfo?.address || 'Plot 42, Galleria High Street, Indiranagar, Bangalore - 560038';
  const storePhone = storeInfo?.phone || '+91 8925184903';
  const storeEmail = storeInfo?.email || 'care@jershihafashion.com';
  const storeHours = storeInfo?.hours || 'Mon - Sun: 10:00 AM - 9:00 PM';
  const whatsappNumber = storeInfo?.whatsapp_number || '918925184903';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I would like to enquire about visiting your boutique store.')}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#FAF7F2] border-t border-[#333333] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 mb-16">
          {/* Column 1: Brand story */}
          <div className="space-y-4">
            {storeInfo?.logo_url ? (
              <div className="flex items-center gap-3">
                <img
                  src={storeInfo.logo_url}
                  alt={storeInfo.store_name || 'Jershiha Fashion'}
                  className="w-12 h-12 object-cover rounded-full border border-[#D4AF37]/50 shadow-sm flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl tracking-[0.12em] font-normal text-white uppercase leading-tight">
                    {storeInfo.store_name || 'JERSHIHA FASHION'}
                  </h3>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#C5A880] block mt-0.5 font-medium">
                    Women's Boutique
                  </span>
                </div>
              </div>
            ) : (
              <h3 className="font-serif text-3xl tracking-[0.15em] font-normal text-white uppercase">
                {storeInfo?.store_name || 'JERSHIHA FASHION'}
              </h3>
            )}
            <p className="text-sm text-[#A8A096] leading-relaxed">
              Your friendly neighborhood women's clothing store. We offer handpicked readymade kurtis, sarees, western wear, and custom stitching & fitting alterations. Visit us in-store or browse online.
            </p>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat with In-Store Stylist</span>
              </a>
            </div>
          </div>

          {/* Column 2: Boutique Information */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-[#C5A880] font-semibold mb-5">
              Boutique Information
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A8A096]">
              <li>
                <Link to="/about" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Our Boutique Story
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Store Hours & Directions
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={scrollToTop} className="hover:text-white transition-colors">
                  Browse Storefront Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Physical store coordinates */}
          <div>
            <h4 className="text-xs uppercase tracking-luxury text-[#C5A880] font-semibold mb-5">
              Visit Our Store
            </h4>
            <ul className="space-y-3.5 text-sm text-[#A8A096]">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-1" />
                <span className="leading-snug">{storeAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                <span>{storePhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C5A880] flex-shrink-0" />
                <span>{storeEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
                <span>{storeHours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="pt-8 border-t border-[#2B2B2B] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C827A] gap-4">
          <p>© {new Date().getFullYear()} Jershiha Fashion Boutique. All rights reserved. Physical store catalog showcase.</p>
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Crafted for elegance & bespoke fashion</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
