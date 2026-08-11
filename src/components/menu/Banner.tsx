// src/components/menu/Banner.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { menuService } from '../../services/menu';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isActive: boolean;
}

const SLIDE_THEMES = [
  {
    bg: 'from-neutral-900 via-blue-950 to-neutral-900',
    glow1: 'bg-blue-600/20',
    glow2: 'bg-indigo-600/10',
    tag: 'bg-blue-600 text-white',
    dot: 'bg-blue-500',
  },
  {
    bg: 'from-neutral-900 via-emerald-950 to-neutral-900',
    glow1: 'bg-emerald-600/20',
    glow2: 'bg-teal-600/10',
    tag: 'bg-emerald-500 text-white',
    dot: 'bg-emerald-400',
  },
  {
    bg: 'from-neutral-900 via-amber-950 to-neutral-900',
    glow1: 'bg-amber-600/20',
    glow2: 'bg-orange-600/10',
    tag: 'bg-amber-500 text-white',
    dot: 'bg-amber-400',
  },
];

export const Banner: React.FC = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  // Drag state
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await menuService.getPromos();
        const safeAll = Array.isArray(all) ? all : [];
        const active = safeAll.filter(b => b && b.isActive);
        if (active.length > 0) setBanners(active);
      } catch (e) {
        setBanners([]);
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const goTo = useCallback((idx: number, dir: 'next' | 'prev') => {
    if (transitioning) return;
    setDirection(dir);
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 350);
  }, [transitioning]);

  const goNext = useCallback(() => {
    if (banners.length <= 1) return;
    goTo((current + 1) % banners.length, 'next');
  }, [current, banners.length, goTo]);

  const goPrev = useCallback(() => {
    if (banners.length <= 1) return;
    goTo((current - 1 + banners.length) % banners.length, 'prev');
  }, [current, banners.length, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [banners.length, goNext]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    if (Math.abs(e.clientX - dragStartX.current) > 5) isDragging.current = true;
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goNext(); else goPrev();
    }
    dragStartX.current = null;
    isDragging.current = false;
  };
  const handleMouseLeave = () => {
    dragStartX.current = null;
    isDragging.current = false;
  };

  // Touch handlers
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goNext(); else goPrev();
    }
    touchStartX.current = null;
  };

  if (banners.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-900 rounded-3xl p-7 md:p-10 text-left relative overflow-hidden shadow-md border border-neutral-800 mb-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
            Promo Minggu Ini
          </span>
          <h3 className="text-xl md:text-3xl font-black text-white mt-4 mb-2 tracking-tight">
            Makan Hemat Katsu Premium Khas Bandung!
          </h3>
          <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed">
            Dapatkan potongan harga khusus untuk setiap pembelian paket kombinasi Nasi Goreng Katsumboo + Minuman Segar.
          </p>
        </div>
      </div>
    );
  }

  const theme = SLIDE_THEMES[current % SLIDE_THEMES.length];
  const banner = banners[current];

  return (
    <div className="relative mb-8 select-none">
      <div
        className={`w-full bg-gradient-to-br ${theme.bg} rounded-3xl p-7 md:p-10 text-left relative overflow-hidden shadow-lg border border-neutral-800 cursor-grab active:cursor-grabbing`}
        style={{ minHeight: '148px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Glow blobs */}
        <div className={`absolute -right-16 -top-16 w-56 h-56 ${theme.glow1} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />
        <div className={`absolute -left-10 -bottom-16 w-48 h-48 ${theme.glow2} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />

        {/* Slide content */}
        <div
          className="relative z-10 max-w-2xl pointer-events-none"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning
              ? `translateX(${direction === 'next' ? '-20px' : '20px'})`
              : 'translateX(0)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <span className={`inline-block ${theme.tag} text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest mb-4`}>
            {banner.title}
          </span>

          {banner.image && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl hidden md:block">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" draggable={false} />
            </div>
          )}

          <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-md pr-4">
            {banner.subtitle}
          </p>
        </div>
      </div>

      {/* Dots only */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 'next' : 'prev')}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === current ? `w-6 ${theme.dot}` : 'w-1.5 bg-neutral-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};