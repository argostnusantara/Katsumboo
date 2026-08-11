// src/pages/Landing/About.tsx
import React from 'react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 px-6 bg-white text-left max-w-5xl mx-auto font-sans">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Tentang Kami</span>
          <h2 className="text-3xl font-black text-neutral-950 uppercase tracking-tight">Dedikasi Rasa Kuliner Terbaik</h2>
          <p className="text-sm text-neutral-500 font-light leading-relaxed">
            Katsumboo lahir dari kecintaan kami terhadap hidangan katsu premium yang tebal dan gurih. Kami percaya bahwa makanan yang lezat datang dari bahan yang segar dan diproses secara bersih dengan standar operasional yang tinggi.
          </p>
        </div>
        <div className="bg-neutral-50 border border-neutral-100 p-8 rounded-3xl space-y-4">
          <div className="flex gap-4 items-start">
            <span className="text-xl">🌟</span>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Bahan Baku Segar</h4>
              <p className="text-xs text-neutral-400 font-light mt-0.5">Daging pilihan premium segar tanpa pengawet.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="text-xl">🫙</span>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">Saus Autentik</h4>
              <p className="text-xs text-neutral-400 font-light mt-0.5">Racikan saus kustom buatan dapur internal khas Katsumboo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};