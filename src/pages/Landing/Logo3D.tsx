// src/pages/Landing/Logo3D.tsx
import React from 'react';

export const Logo3D: React.FC = () => {
  return (
    <section className="py-12 bg-[#FDFBF7] flex items-center justify-center border-y border-neutral-100">
      <div className="w-32 h-32 bg-neutral-900 rounded-full flex items-center justify-center shadow-xl border border-neutral-800 animate-pulse group hover:scale-105 transition-transform duration-300">
        <span className="text-3xl filter drop-shadow-md group-hover:rotate-12 transition-transform">🍱</span>
      </div>
    </section>
  );
};