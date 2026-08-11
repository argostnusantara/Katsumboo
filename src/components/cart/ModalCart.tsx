// src/components/cart/ModalCart.tsx
import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { CartItem } from './CartItem';

interface ModalCartProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCheckout: () => void;
}

export const ModalCart: React.FC<ModalCartProps> = ({ isOpen, onClose, onNavigateToCheckout }) => {
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop Gelap */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10 text-left">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header Modal */}
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Keranjang Kuliner</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">Rincian menu Katsumboo pilihanmu</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 font-bold text-sm">
              ✕ Tutup
            </button>
          </div>

          {/* Konten Daftar Item Belanjaan */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {safeCartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
                <span className="text-4xl mb-2">🍱</span>
                <p className="text-xs font-bold">Keranjang belanja kamu masih kosong.</p>
                <p className="text-[10px] text-neutral-400 mt-1">Yuk, isi dengan Chicken Katsu tebal favoritmu!</p>
              </div>
            ) : (
              (safeCartItems || []).map((item, idx) => (
                <CartItem 
                  key={idx} 
                  item={item} 
                  index={idx} 
                  onRemove={removeFromCart} 
                />
              ))
            )}
          </div>

          {/* Footer Modal & Total Pembayaran */}
          {safeCartItems.length > 0 && (
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-neutral-500">Subtotal Makanan:</span>
                <span className="text-base font-black text-blue-600">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
              
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCheckout();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider text-center shadow-md transition-all"
              >
                Lanjut Bayar ➜
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};