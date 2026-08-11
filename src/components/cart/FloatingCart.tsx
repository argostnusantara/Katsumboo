// src/components/cart/FloatingCart.tsx
import React from 'react';
import { useCart } from '../../contexts/CartContext';

interface FloatingCartProps {
  onClick: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ onClick }) => {
  const { cartItems, totalPrice } = useCart();

  if (cartItems.length === 0) return null;

  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-20 right-6 bg-blue-600 text-white px-5 py-3.5 rounded-full shadow-2xl z-40 flex items-center gap-3 border border-blue-500 transform active:scale-95 transition-all animate-bounce"
    >
      <span className="text-lg">🛒</span>
      <div className="flex flex-col text-left">
        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-200 -mb-0.5">
          {cartItems.length} Item
        </span>
        <span className="text-xs font-black">
          Rp {totalPrice.toLocaleString('id-ID')}
        </span>
      </div>
    </button>
  );
};