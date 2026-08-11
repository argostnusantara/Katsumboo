// src/components/menu/Cardmenu.tsx
import React, { useState, useEffect } from 'react';
import type { Product } from '../../types/menu';

interface CardMenuProps {
  product: Product;
  onAddToCart: (customData: { notes: string; customizations?: Record<string, string> }) => void;
}

export const CardMenu: React.FC<CardMenuProps> = ({ product, onAddToCart }) => {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});

  // Initialize selected customizations to first option when modal opens
  useEffect(() => {
    if (showCustomizeModal && product.customizations) {
      const initial: Record<string, string> = {};
      product.customizations.forEach((c) => {
        if (c.options.length > 0) {
          initial[c.id] = c.options[0];
        }
      });
      setSelectedCustomizations(initial);
    }
  }, [showCustomizeModal, product]);

  const handleConfirmAdd = () => {
    onAddToCart({
      notes: notes,
      customizations: selectedCustomizations
    });
    setShowCustomizeModal(false);
    setNotes('');
    setSelectedCustomizations({});
  };

  const safeCustomizations = Array.isArray(product?.customizations) ? product.customizations : [];
  const hasCustomizations = safeCustomizations.length > 0;

  return (
    <div className="bg-[#FDFBF7] rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col flex-1 text-left">
      {/* Gambar Menu */}
      <div className="relative overflow-hidden aspect-square bg-neutral-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
          {typeof product.category === 'object' && product.category !== null ? (product.category as any).name : String(product.category || '')}
        </div>
      </div>

      {/* Konten & Informasi */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <h4 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {product.name}
          </h4>
          <p className="text-neutral-500 text-sm font-light leading-relaxed mb-2">
            {product.desc}
          </p>
          {/* Badge kustomisasi tersedia */}
          {hasCustomizations && (
            <div className="flex flex-wrap gap-1 mb-2">
              {(safeCustomizations || []).map(c => (
                <span key={c.id || c.name} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                  {c.name}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm font-black text-blue-600">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
        </div>
        
        <button 
          onClick={() => setShowCustomizeModal(true)}
          disabled={!product.isAvailable}
          className={`mt-6 w-full text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md uppercase tracking-wider ${
            product.isAvailable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-neutral-400 cursor-not-allowed shadow-none'
          }`}
        >
          {product.isAvailable ? '+ Atur Varian & Pesan' : 'Habis'}
        </button>
      </div>

      {/* Modal Kustomisasi */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCustomizeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 font-bold text-sm"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-black text-neutral-900 mb-1">Kustomisasi Menu</h3>
            <p className="text-xs text-neutral-400 mb-5">{product.name}</p>

            {/* Dynamic Customizations dari Admin */}
            {hasCustomizations ? (
              <div className="space-y-5 mb-5">
                {(safeCustomizations || []).map((cust, cIdx) => {
                  const safeOptions = Array.isArray(cust?.options) ? cust.options : [];
                  return (
                    <div key={cust.id || cIdx} className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {cust.name} {cust.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(safeOptions || []).map((opt) => {
                          const isSelected = selectedCustomizations[cust.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSelectedCustomizations({ ...selectedCustomizations, [cust.id]: opt })}
                              className={`py-2 px-4 text-xs font-medium rounded-xl border transition-all text-center ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold' 
                                  : 'border-neutral-200 text-neutral-600 bg-neutral-50 hover:bg-neutral-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-5 py-4 bg-neutral-50 rounded-2xl text-center">
                <p className="text-xs text-neutral-400">Tidak ada kustomisasi untuk menu ini.</p>
              </div>
            )}

            {/* Catatan Tambahan */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Catatan Pesanan (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Saus dipisah, tanpa bawang, dll..."
                className="w-full p-3 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 transition-colors h-20 resize-none"
              />
            </div>

            <button
              onClick={handleConfirmAdd}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md uppercase tracking-wider"
            >
              Masukkan ke Keranjang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};