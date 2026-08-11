// src/components/layout/Footer.tsx
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#1A1A1A] text-neutral-400 py-16 px-6 text-center border-t border-neutral-800/40">
      <div className="max-w-4xl mx-auto">
        <h4 className="text-white text-2xl font-bold mb-3 tracking-tight">Nikmati Kelezatan Katsumboo Sekarang.</h4>
        <p className="mb-10 font-light text-neutral-400 text-sm">Hidangan chicken katsu premium segar pilihan kuliner terbaik kota Bandung.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-12">
          <a href="https://www.instagram.com/katsumboo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-white text-neutral-900 hover:bg-neutral-100 transition-all font-bold px-4 py-2.5 rounded-xl text-xs tracking-tight w-full gap-2 border border-neutral-200">
            <span>📸 @katsumboo</span>
          </a>
          <a href="https://gofood.link" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-white text-neutral-900 hover:bg-neutral-100 transition-all font-bold px-4 py-2.5 rounded-xl text-xs tracking-tight w-full gap-2 border border-neutral-200">
            <span>🛵 GoFood Bandung</span>
          </a>
        </div>
        
        <div className="text-[10px] uppercase tracking-widest pt-6 border-t border-neutral-800 font-mono text-neutral-600">
          &copy; 2026 Katsumboo. All rights reserved.
        </div>
      </div>
    </footer>
  );
};