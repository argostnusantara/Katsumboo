// src/components/layout/BottomNavigation.tsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { inboxService } from '../../services/inbox';

interface BottomNavigationProps {
  onOpenCartModal: () => void;
  onNavigateTo: (page: 'home' | 'login' | 'register' | 'admin' | 'profile' | 'inbox' | 'tracking' | 'history') => void;
  activePage: 'home' | 'login' | 'register' | 'admin' | 'profile' | 'inbox' | 'tracking' | 'history';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  onOpenCartModal, 
  onNavigateTo,
  activePage
}) => {
  const { cartItems } = useCart();
  const { isLoggedIn, user } = useAuth();
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/95 backdrop-blur-md border-t border-neutral-800/60 z-50 flex justify-around items-center py-2 px-4 text-white shadow-lg">
      
      {/* Tombol Beranda / Menu */}
      <button 
        onClick={() => onNavigateTo('home')}
        className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
          activePage === 'home' ? 'text-blue-500' : 'text-neutral-400 hover:text-white'
        }`}
      >
        <span className="text-xl">🍱</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
      </button>

      {/* Tombol Keranjang Belanja */}
      <button 
        onClick={onOpenCartModal}
        className="flex flex-col items-center gap-1 p-2 text-neutral-400 hover:text-white relative"
      >
        <div className="relative">
          <span className="text-xl">🛒</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {cartItems.length}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
      </button>

      {/* Tombol Kotak Masuk (Inbox) */}
      {isLoggedIn && (
        <button 
          onClick={() => onNavigateTo('inbox')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 relative ${
            activePage === 'inbox' ? 'text-blue-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <span className="text-xl">📬</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-550 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Inbox</span>
        </button>
      )}

      {/* Tombol Akun / Admin Dashboard */}
      {isLoggedIn && user ? (
        <button 
          onClick={() => onNavigateTo(user.role === 'admin' ? 'admin' : 'profile' as any)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
            activePage === 'admin' || activePage === 'profile' ? 'text-blue-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span className="text-xl">{user.role === 'admin' ? '⚙️' : '👤'}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[60px]">
            {user.role === 'admin' ? 'Admin' : 'Profil'}
          </span>
        </button>
      ) : (
        <button 
          onClick={() => onNavigateTo('login')}
          className={`flex flex-col items-center gap-1 p-2 transition-colors duration-200 ${
            activePage === 'login' || activePage === 'register' ? 'text-blue-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <span className="text-xl">🔑</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Masuk</span>
        </button>
      )}

    </div>
  );
};