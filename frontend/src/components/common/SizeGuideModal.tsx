import React, { useState, useEffect } from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeChart = [
    { size: 'XS (32)', bustIn: '32"', waistIn: '26"', hipIn: '35"', lengthIn: '44"', bustCm: '81 cm', waistCm: '66 cm', hipCm: '89 cm', lengthCm: '112 cm' },
    { size: 'S (34)', bustIn: '34"', waistIn: '28"', hipIn: '37"', lengthIn: '45"', bustCm: '86 cm', waistCm: '71 cm', hipCm: '94 cm', lengthCm: '114 cm' },
    { size: 'M (36)', bustIn: '36"', waistIn: '30"', hipIn: '39"', lengthIn: '45.5"', bustCm: '91 cm', waistCm: '76 cm', hipCm: '99 cm', lengthCm: '116 cm' },
    { size: 'L (38)', bustIn: '38"', waistIn: '32"', hipIn: '41"', lengthIn: '46"', bustCm: '97 cm', waistCm: '81 cm', hipCm: '104 cm', lengthCm: '117 cm' },
    { size: 'XL (40)', bustIn: '40"', waistIn: '34"', hipIn: '43"', lengthIn: '46.5"', bustCm: '102 cm', waistCm: '86 cm', hipCm: '109 cm', lengthCm: '118 cm' },
    { size: 'XXL (42)', bustIn: '42"', waistIn: '36"', hipIn: '45"', lengthIn: '47"', bustCm: '107 cm', waistCm: '91 cm', hipCm: '114 cm', lengthCm: '119 cm' },
    { size: 'Free Size', bustIn: '32"-40"', waistIn: '26"-34"', hipIn: '35"-44"', lengthIn: 'Varies', bustCm: '81-102 cm', waistCm: '66-86 cm', hipCm: '89-112 cm', lengthCm: 'Varies' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white max-w-2xl w-full p-6 sm:p-8 border border-[#EAE6E1] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8C827A] hover:text-black transition-colors"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-luxury text-[#B86B5A] font-semibold">
          <Ruler className="w-4 h-4" />
          <span>Boutique Fitting Guide</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-boutique-charcoal font-medium mb-2">
          Standard Women's Size Chart
        </h2>
        <p className="text-xs text-[#6B6B6B] mb-6 leading-relaxed">
          Our garments are tailored with 1.5-inch in-seam margins for easy custom adjustments. Visit our Bangalore physical boutique for complimentary in-person alterations!
        </p>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EAE6E1]">
          <span className="text-xs uppercase tracking-wider font-semibold text-boutique-charcoal">
            Measurements:
          </span>
          <div className="flex bg-[#FAF7F2] p-1 border border-[#EAE6E1] text-xs">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 font-semibold transition-colors ${
                unit === 'inches' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#8C827A] hover:text-black'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 font-semibold transition-colors ${
                unit === 'cm' ? 'bg-[#1A1A1A] text-white shadow-sm' : 'text-[#8C827A] hover:text-black'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#EAE6E1] mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#8C827A] uppercase tracking-wider border-b border-[#EAE6E1]">
              <tr>
                <th className="py-2.5 px-3">Size (Letter / Numeric)</th>
                <th className="py-2.5 px-3">Bust</th>
                <th className="py-2.5 px-3">Waist</th>
                <th className="py-2.5 px-3">Hip</th>
                <th className="py-2.5 px-3">Standard Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1]">
              {sizeChart.map((row) => (
                <tr key={row.size} className="hover:bg-[#FAF7F2]/50">
                  <td className="py-2 px-3 font-bold text-boutique-charcoal">{row.size}</td>
                  <td className="py-2 px-3">{unit === 'inches' ? row.bustIn : row.bustCm}</td>
                  <td className="py-2 px-3">{unit === 'inches' ? row.waistIn : row.waistCm}</td>
                  <td className="py-2 px-3">{unit === 'inches' ? row.hipIn : row.hipCm}</td>
                  <td className="py-2 px-3 text-[#8C827A]">{unit === 'inches' ? row.lengthIn : row.lengthCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Tips */}
        <div className="p-4 bg-[#FAF7F2] border border-[#EAE6E1] space-y-2 text-xs text-[#4A4A4A]">
          <p className="font-semibold text-boutique-charcoal flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>How to Measure for the Perfect Fit:</span>
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[#6B6B6B]">
            <li><strong>Bust:</strong> Measure around the fullest part of your chest with measuring tape parallel to the floor.</li>
            <li><strong>Waist:</strong> Measure around your natural waistline, typically the narrowest point above your belly button.</li>
            <li><strong>Hips:</strong> Stand with your feet together and measure around the fullest part of your hips.</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs uppercase tracking-luxury font-semibold"
          >
            Got it, Return to Dress
          </button>
        </div>
      </div>
    </div>
  );
};

