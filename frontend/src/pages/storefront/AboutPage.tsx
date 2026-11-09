import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Scissors, Clock, MapPin, ArrowRight, ShoppingBag, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutPage: React.FC = () => {
  const { storeInfo } = useStore();
  const whatsappNumber = storeInfo?.whatsapp_number || '918925184903';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I would like to know more about your in-store dresses and customisations.')}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Story Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-3 block">
            About Our Store
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-boutique-charcoal font-normal leading-tight mb-5">
            Everyday Style, Festive Wear & Custom Fitting.
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed">
            Welcome to Jershiha Fashion! We are your friendly neighborhood women's clothing store, bringing our physical shop's collection directly to your fingertips.
          </p>
        </div>

        {/* Narrative & Visual Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-5 text-sm text-[#4A4A4A] leading-relaxed">
            <h2 className="font-serif text-2xl sm:text-3xl text-boutique-charcoal font-medium">
              Handpicked Ready Clothes & Custom Adjustments
            </h2>
            
            <p>
              At Jershiha Fashion, we believe dressing well shouldn't be complicated or overpriced. We carefully source and handpick our clothing collections—bringing you trending women's dresses, stylish casual wear, tops, and celebration outfits that match modern trends and everyday comfort.
            </p>

            <p>
              Along with our handpicked readymade designs, we also specialize in <strong>customisation and fitting adjustments</strong>. Whether you need sleeve alterations, hem adjustments, or personalized styling tweaks, we take the time to ensure your outfit fits you comfortably and flatters your look.
            </p>

            <p>
              We built this online catalog so you can browse everything currently available on our shop racks from the comfort of your home. If you like something, check your size, message us directly on WhatsApp to hold it or ask questions, or walk into our physical store to try it on in person.
            </p>

            {/* Quick Highlights */}
            <div className="pt-4 flex items-center gap-6 border-t border-[#EAE6E1]">
              <div>
                <span className="font-serif text-2xl font-bold text-[#1A1A1A]">Handpicked</span>
                <p className="text-[11px] uppercase tracking-wider text-[#8C827A] mt-0.5">Ready to Wear</p>
              </div>
              <div className="w-px h-8 bg-[#EAE6E1]" />
              <div>
                <span className="font-serif text-2xl font-bold text-[#1A1A1A]">Custom Fit</span>
                <p className="text-[11px] uppercase tracking-wider text-[#8C827A] mt-0.5">Alterations Available</p>
              </div>
              <div className="w-px h-8 bg-[#EAE6E1]" />
              <div>
                <span className="font-serif text-2xl font-bold text-[#1A1A1A]">Friendly</span>
                <p className="text-[11px] uppercase tracking-wider text-[#8C827A] mt-0.5">WhatsApp Help</p>
              </div>
            </div>

            <div className="pt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold shadow transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat with Us on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="relative aspect-[4/5] bg-white border border-[#EAE6E1] p-3 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80"
              alt="Jershiha Fashion Store & Clothes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 3 Meaningful Store Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-[#EAE6E1]">
          <div className="p-7 bg-white border border-[#EAE6E1] text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-[#B86B5A] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-medium text-boutique-charcoal mb-2">Carefully Handpicked</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              We select trendy, good-quality readymade dresses and everyday women's wear at fair, affordable prices.
            </p>
          </div>

          <div className="p-7 bg-white border border-[#EAE6E1] text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-amber-700 flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-medium text-boutique-charcoal mb-2">Custom Fitting & Stitching</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Need alterations or size adjustments? We customize select garments and offer fitting alterations so you feel comfortable and confident.
            </p>
          </div>

          <div className="p-7 bg-white border border-[#EAE6E1] text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-medium text-boutique-charcoal mb-2">Friendly In-Store Experience</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Browse our catalog online anytime, then visit our physical store to check fabrics, try on your favorite outfits, and get friendly personal assistance.
            </p>
          </div>
        </div>

        {/* Bottom Store Visit Invitation */}
        <div className="mt-8 p-8 bg-[#FAF7F2] border border-[#EAE6E1] text-center">
          <h3 className="font-serif text-xl text-boutique-charcoal font-medium mb-2">
            Visit Our Store Today
          </h3>
          <p className="text-xs text-[#6B6B6B] max-w-lg mx-auto mb-6">
            We are open 7 days a week ({storeInfo?.hours || '10:00 AM – 9:00 PM'}). Drop by to try out our dresses, explore our latest arrivals, or ask for custom fitting!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold transition-colors shadow"
            >
              Explore All Dresses
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-white hover:bg-stone-100 border border-[#D5C4B0] text-boutique-charcoal text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              View Store Location & Address
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
