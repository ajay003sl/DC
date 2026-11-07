import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Send, MapPin, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { storeInfo } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const whatsappNumber = (storeInfo?.whatsapp_number || '918925184903').replace(/[^0-9]/g, '');

  const sendWhatsApp = (customText?: string) => {
    const textToSend = customText || message || 'Hello Jershiha Fashion! I am browsing your online catalog and would like to ask a question.';
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setMessage('');
  };

  const quickPrompts = [
    "Is a dress currently available in my size?",
    "Can I visit the store today to try on dresses?",
    "Do you offer custom sleeve or length alterations?"
  ];

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white border border-[#EAE6E1] shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#1A1A1A] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#1A1A1A] flex items-center justify-center font-serif text-lg font-bold">
                  JF
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h4 className="font-serif text-base font-medium leading-none">Jershiha Fashion Stylist</h4>
                <p className="text-[11px] text-[#A8A096] mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • {storeInfo?.hours || 'Store Open Daily'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#A8A096] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#FAF7F2] space-y-3 max-h-72 overflow-y-auto text-xs">
            {/* Store Greeting */}
            <div className="bg-white p-3 border border-[#EAE6E1] shadow-sm text-[#4A4A4A] space-y-1 rounded-sm">
              <p className="font-semibold text-boutique-charcoal flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Namaste & Welcome to Jershiha Fashion!</span>
              </p>
              <p>
                How may our in-house boutique stylist assist you today? Feel free to ask about sizes, fabrics, or book an in-store trial.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase tracking-wider text-[#8C827A] font-semibold">Quick Enquiries:</p>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendWhatsApp(prompt)}
                  className="w-full text-left p-2 bg-white hover:bg-[#F2ECE1] border border-[#EAE6E1] text-[11px] text-boutique-charcoal transition-colors rounded-sm flex items-center justify-between"
                >
                  <span>{prompt}</span>
                  <Send className="w-3 h-3 text-emerald-600 flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-[#EAE6E1] flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendWhatsApp();
              }}
              placeholder="Type your question..."
              className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAE6E1] focus:outline-none focus:border-boutique-charcoal"
            />
            <button
              onClick={() => sendWhatsApp()}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none flex items-center justify-center transition-colors shadow-sm"
              title="Open in WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full"
        aria-label="Chat with store stylist on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="text-xs uppercase tracking-luxury font-semibold hidden sm:inline">
          Chat with Stylist
        </span>
      </button>
    </div>
  );
};
