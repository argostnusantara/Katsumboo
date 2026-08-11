// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { CartItem } from '../types/cart';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      // Mencari apakah item dengan ID, pilihan saus, level pedas, dan catatan yang sama persis sudah ada
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.selectedSauce === newItem.selectedSauce &&
          item.levelPedas === newItem.levelPedas &&
          item.notes === newItem.notes &&
          JSON.stringify(item.selectedCustomizations || {}) === JSON.stringify(newItem.selectedCustomizations || {})
      );

      // Jika ada item yang kembar identik, cukup tambahkan kuantitasnya
      if (existingIndex > -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex].quantity += newItem.quantity;
        return updatedCart;
      }
      
      // Jika item baru berbeda varian/catatan, masukkan sebagai baris baru
      return [...prev, newItem];
    });
  };

  const removeFromCart = (indexToRemove: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearCart = () => setCartItems([]);

  // Menghitung total harga belanja secara otomatis dan real-time
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
};