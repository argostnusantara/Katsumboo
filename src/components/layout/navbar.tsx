// src/components/layout/navbar.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { inboxService } from '../../services/inbox';

interface NavbarProps {
  onOpenCartModal: () => void;
  onNavigateTo: (page: 'home' | 'login' | 'register' | 'admin' | 'profile' | 'inbox' | 'tracking' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCartModal, onNavigateTo }) => {
  const { isLoggedIn, user, logoutGlobal } = useAuth();
  const { cartItems } = useCart();
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnread = async () => {
    if (isLoggedIn && user) {
      try {
        const res = await inboxService.getUnreadCount();
        setUnreadCount(res.count);
      } catch {
        setUnreadCount(0);
      }
    } else {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    checkUnread();
    const handleStorage = () => {
      checkUnread();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isLoggedIn, user]);

  return (
    <nav className="fixed w-full bg-[#1A1A1A]/90 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center text-white border-b border-neutral-800/40">
      {/* Sisi Kiri: Logo */}
      <div onClick={() => onNavigateTo('home')} className="flex items-center gap-3 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black border border-neutral-700 tracking-tighter">
          KB
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xl font-black tracking-tighter uppercase text-white">KATSUMBOO</span>
          <span className="text-[9px] text-blue-500 font-bold tracking-widest uppercase -mt-1">E-Commerce F&B</span>
        </div>
      </div>

      {/* Sisi Kanan: Navigasi, Keranjang, & Akun */}
      <div className="flex items-center gap-6 text-sm uppercase tracking-widest text-neutral-300">
        <button onClick={() => onNavigateTo('home')} className="hover:text-blue-500 transition-colors text-xs font-medium uppercase tracking-wider">
          Menu
        </button>

        {/* Ikon Inbox (hanya jika logged in) */}
        {isLoggedIn && (
          <div 
            onClick={() => onNavigateTo('inbox')}
            className="relative cursor-pointer hover:text-blue-500 transition-colors flex items-center p-2 select-none"
          >
            <span className="text-lg">📬</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
        )}
        
        {/* Ikon Keranjang Belanja */}
        <div 
          onClick={onOpenCartModal}
          className="relative cursor-pointer hover:text-blue-500 transition-colors flex items-center p-2 select-none"
        >
          <span className="text-lg">🛒</span>
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {cartItems.length}
            </span>
          )}
        </div>

        {/* Cek Status Login Global */}
        {isLoggedIn && user ? (
          <div className="flex items-center gap-3 normal-case tracking-normal text-xs font-bold">
            <button 
              onClick={() => onNavigateTo('profile' as any)}
              className="text-neutral-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <span>👤 {user.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                user.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {user.role === 'admin' ? 'ADMIN' : 'PELANGGAN'}
              </span>
            </button>

            {user.role === 'admin' && (
              <button 
                onClick={() => onNavigateTo('admin')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider cursor-pointer transition-all shadow-sm flex items-center gap-1"
              >
                Admin Panel ⚙️
              </button>
            )}

            <button 
              onClick={() => {
                logoutGlobal();
                onNavigateTo('login');
              }}
              title="Keluar dari akun ini untuk ganti akun"
              className="bg-neutral-800 hover:bg-red-900/40 text-neutral-400 hover:text-red-400 px-3 py-1.5 rounded-xl border border-neutral-700 transition-all font-sans font-bold uppercase tracking-wider text-[10px] cursor-pointer"
            >
              Keluar / Ganti Akun
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigateTo('login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md transform hover:scale-105 uppercase tracking-wider cursor-pointer"
          >
            Masuk
          </button>
        )}
      </div>
    </nav>
  );
};