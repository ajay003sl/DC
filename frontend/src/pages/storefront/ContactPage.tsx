import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, ExternalLink, Navigation } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { storeInfo } = useStore();
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const storeAddress = storeInfo?.address || 'Thazheveettuvilakam, Puthiyathura, Pulluvila P.O. - 695526';
  const storePhone = storeInfo?.phone || '+91 8925184903';
  const storeEmail = storeInfo?.email || 'care@jershihafashion.com';
  const storeHours = storeInfo?.hours || 'Mon - Sun: 10:00 AM - 9:00 PM';
  const whatsappNumber = storeInfo?.whatsapp_number || '918925184903';
  const mapsEmbedUrl = storeInfo?.maps_embed_url || 'https://maps.google.com/maps?q=8.335898,77.046682&t=&z=16&ie=UTF8&iwloc=&output=embed';
  const googleMapsAppUrl = 'https://maps.app.goo.gl/gphqoqjNfCg7FzmX7';

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Jershiha Fashion! I would like to enquire about visiting your boutique store.')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-fill a WhatsApp message with the form details
    const msg = `Hello Jershiha Fashion!\n\nNew boutique enquiry from website:\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nMessage: ${formData.message}`;
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    setFormSent(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold mb-2 block">
            Visit & Connect
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-boutique-charcoal font-normal">
            We Welcome You to Our Boutique
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-3 leading-relaxed">
            Experience personalised fashion styling, drape consultations, and in-person fabric trials at our flagship boutique store.
          </p>
        </div>

        {/* 2-Column Info & Enquiry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Left: Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 border border-[#EAE6E1] shadow-sm space-y-6">
              <h2 className="font-serif text-2xl text-boutique-charcoal font-medium pb-4 border-b border-[#EAE6E1]">
                Store Coordinates
              </h2>

              <div className="space-y-5 text-sm text-[#4A4A4A]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#B86B5A] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#8C827A] font-semibold">Address</p>
                    <p className="mt-1 leading-snug">{storeAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#B86B5A] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#8C827A] font-semibold">Store Business Hours</p>
                    <p className="mt-1">{storeHours}</p>
                    <p className="text-xs text-[#8C827A] mt-0.5">Open all 7 days for fittings</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#8C827A] font-semibold">Direct WhatsApp Line</p>
                    <p className="mt-1 font-mono font-medium">{storePhone}</p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline font-semibold block mt-1"
                    >
                      Click here to start WhatsApp chat →
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#C5A880] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#8C827A] font-semibold">Email Concierge</p>
                    <p className="mt-1 font-mono">{storeEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 border border-[#EAE6E1] shadow-sm">
              <h2 className="font-serif text-2xl text-boutique-charcoal font-medium mb-2">
                Send an In-Store Appointment Request
              </h2>
              <p className="text-xs text-[#8C827A] mb-6">
                Have a question regarding bridal custom orders, bulk family attire, or size availability? Send us a message and our store team will respond promptly.
              </p>

              {formSent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-serif text-lg font-medium">Thank you for connecting!</p>
                  <p className="text-xs text-emerald-700">
                    Your enquiry has been forwarded directly to our store WhatsApp. We look forward to assisting you.
                  </p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="mt-4 px-4 py-2 text-xs uppercase tracking-wider bg-emerald-700 text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-boutique-charcoal font-medium mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-boutique-charcoal font-medium mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 XXXXX"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-boutique-charcoal font-medium mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ananya@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-boutique-charcoal font-medium mb-1">
                      Message / Design Enquiry *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what dress, size, or occasion you're interested in trying out..."
                      className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit & Connect on WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Google Maps Location Embed */}
        <div className="bg-white p-4 sm:p-6 border border-[#EAE6E1] shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl text-boutique-charcoal font-medium">Boutique Location Map</h3>
              <p className="text-xs text-[#8C827A] mt-0.5">{storeAddress}</p>
            </div>
            <a
              href={googleMapsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-wider font-semibold transition-all shadow-sm self-start sm:self-auto"
            >
              <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
          <div className="w-full h-80 sm:h-96 bg-gray-100 overflow-hidden border border-[#EAE6E1]">
            <iframe
              title="Jershiha Fashion Store Location"
              src={mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

