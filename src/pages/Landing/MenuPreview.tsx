// src/pages/Landing/MenuPreview.tsx
import React from 'react';

export const MenuPreview: React.FC = () => {
  const previews = [
    { name: 'Nasi Goreng Katsu', desc: 'Perpaduan lokal gurih & crispy.', price: 'Rp 25.000' },
    { name: 'Spaghetti Katsu Premium', desc: 'Pasta lembut dengan saus kustom.', price: 'Rp 27.000' }
  ];

  return (
    <section className="py-20 px-6 bg-[#FDFBF7] text-left border-t border-neutral-100">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Menu Andalan</span>
          <h2 className="text-3xl font-black text-neutral-950 uppercase tracking-tight mt-1">Paling Banyak Dicari</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {previews.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{item.name}</h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-light">{item.desc}</p>
              </div>
              <span className="text-xs font-black text-blue-600 shrink-0 ml-4">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};