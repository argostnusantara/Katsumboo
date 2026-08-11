// src/pages/Landing/ProblemSolution.tsx
import React from 'react';

export const ProblemSolution: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-white text-left border-t border-neutral-100">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        <div className="bg-red-50/50 border border-red-100 p-6 rounded-2xl">
          <h4 className="text-xs font-black text-red-700 uppercase tracking-wider mb-2">❌ Masalah Kuliner Umum</h4>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Seringkali katsu yang dijual di pasaran memiliki lapisan tepung yang terlalu tebal namun daging di dalamnya sangat tipis, atau saus pelengkapnya terasa hambar.
          </p>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
          <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider mb-2">✔️ Solusi Katsumboo</h4>
          <p className="text-xs text-neutral-500 font-light leading-relaxed">
            Kami menghadirkan daging ayam premium pilihan potongan tebal dengan balutan tepung crispy yang pas, disajikan bersama varian saus racikan autentik.
          </p>
        </div>
      </div>
    </section>
  );
};