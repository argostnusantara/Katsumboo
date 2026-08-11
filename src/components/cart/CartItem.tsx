// src/components/cart/CartItem.tsx
import React from 'react';
import type { CartItem as CartItemType } from '../../types/cart';

interface CartItemProps {
  item: CartItemType;
  index: number;
  onRemove: (index: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, index, onRemove }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100/80 text-left">
      {/* Gambar Mini */}
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-16 h-16 object-cover rounded-xl bg-neutral-200 shrink-0"
      />
      
      {/* Detail Item */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-black text-neutral-900 truncate">{item.name}</h4>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {item.selectedSauce && item.selectedSauce !== 'None' && item.selectedSauce !== '' && (
            <span className="text-[9px] bg-neutral-200/60 text-neutral-600 font-bold px-1.5 py-0.5 rounded">
              Saus: {item.selectedSauce}
            </span>
          )}
          {item.levelPedas !== undefined && item.levelPedas > 0 && (
            <span className="text-[9px] bg-amber-500/10 text-amber-700 font-bold px-1.5 py-0.5 rounded">
              Lvl {item.levelPedas}
            </span>
          )}
          {item.selectedCustomizations && Object.entries(item.selectedCustomizations).map(([key, val]) => (
            <span key={key} className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-1.5 py-0.5 rounded">
              {key}: {val}
            </span>
          ))}
          <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">
            x{item.quantity}
          </span>
        </div>
        {item.notes && (
          <p className="text-[9px] text-neutral-400 italic mt-1 truncate">
            "Catatan: {item.notes}"
          </p>
        )}
        <p className="text-xs font-black text-blue-600 mt-2">
          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
        </p>
      </div>

      {/* Tombol Hapus */}
      <button 
        onClick={() => onRemove(index)}
        className="text-neutral-400 hover:text-red-500 text-xs font-bold p-1 transition-colors"
        title="Hapus item"
      >
        ✕
      </button>
    </div>
  );
};