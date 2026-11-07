import React, { useState, useRef } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden cursor-crosshair aspect-[3/4] bg-[#F5F2EB] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-top transition-transform duration-200 ${
          isZoomed ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Magnified zoomed view */}
      {isZoomed && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
            backgroundSize: '220%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  );
};

