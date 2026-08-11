// src/pages/Landing/Hero.tsx
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="min-h-[85vh] bg-[#1A1A1A] text-white flex items-center justify-center px-6 relative overflow-hidden pt-20">
      {/* Efek Gradasi Latar */}
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-3xl text-center space-y-6 z-10">
        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
          Bandung Premium Culinary
        </span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
          Kelezatan Chicken Katsu <br />
          <span className="text-blue-500">Premium & Otentik</span>
        </h1>
        <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
          Menyajikan hidangan katsu tebal, renyah, dan segar pilihan terbaik di Bandung. Dibuat dengan resep rahasia dan bahan baku berkualitas tinggi setiap harinya.
        </p>
      </div>
    </section>
  );
};