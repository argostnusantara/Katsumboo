// src/components/common/NewUserVoucherPopup.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { inboxService } from '../../services/inbox';
import { Tag, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const NewUserVoucherPopup: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user && user.role !== 'admin') {
      const key = `katsumboo_welcomed_${user.id}`;
      const hasSeen = localStorage.getItem(key);
      if (!hasSeen) {
        // Trigger popup after a small delay
        const timer = setTimeout(() => {
          setShowPopup(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setShowPopup(false);
    }
  }, [isLoggedIn, user]);

  const handleClaim = async () => {
    if (!user) return;

    // Send the WELCOME5K voucher to the user's inbox
    const inboxMessage = {
      type: 'voucher' as const,
      title: '🎉 Selamat Datang di Katsumboo! Voucher Diskon Rp 5.000',
      body: 'Terima kasih telah bergabung bersama kami. Nikmati potongan Rp 5.000 untuk transaksi pertama Anda dengan menggunakan kode voucher di bawah.',
      voucherCode: 'WELCOME5K',
    };

    try {
      await inboxService.createMessage(inboxMessage);
      localStorage.setItem(`katsumboo_welcomed_${user.id}`, 'true');
      setShowPopup(false);
      toast.success('Selamat! Voucher selamat datang masuk ke Inbox Anda! 🎟️', { duration: 4000 });
    } catch (err: any) {
      toast.error(err.message || 'Gagal klaim voucher.');
    }
  };

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`katsumboo_welcomed_${user.id}`, 'true');
    }
    setShowPopup(false);
  };

  if (!showPopup || !user) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center text-white overflow-hidden group">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white font-bold text-sm cursor-pointer"
        >
          ✕
        </button>

        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Sparkles className="w-8 h-8 text-blue-500" />
        </div>

        <h3 className="text-lg font-black tracking-tight text-white">Spesial Untuk Anda! ✨</h3>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed px-2">
          Halo <strong className="text-white">{user.name}</strong>, selamat bergabung! Dapatkan voucher belanja gratis pertama Anda.
        </p>

        <div className="my-6 p-4 bg-blue-600/10 border border-dashed border-blue-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Welcome Promo</span>
            <span className="font-extrabold text-sm block">Potongan Rp 5.000</span>
            <span className="text-[9px] text-neutral-450 block">Min. Belanja Rp 15.000</span>
          </div>
          <div className="shrink-0 bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <button
          onClick={handleClaim}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider shadow-md cursor-pointer hover:scale-105"
        >
          Claim Voucher ➜
        </button>

        <button
          onClick={handleClose}
          className="text-neutral-500 hover:text-neutral-300 font-bold text-[10px] uppercase tracking-wider block mx-auto mt-4 transition-colors cursor-pointer"
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );
};

export default NewUserVoucherPopup;
