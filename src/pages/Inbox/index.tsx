import React, { useState, useEffect } from 'react';
import { inboxService } from '../../services/inbox';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/Footer';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { Mail, MailOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { InboxMessage } from '../../types/inbox';

interface InboxProps {
  onNavigateTo: (page: 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'history' | 'profile' | 'tracking' | 'inbox') => void;
}

export const InboxPage: React.FC<InboxProps> = ({ onNavigateTo }) => {
  const { isLoggedIn, user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);

  const loadInbox = async () => {
    if (isLoggedIn && user) {
      try {
        const list = await inboxService.getMessages();
        setMessages(list);
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    loadInbox();
  }, [isLoggedIn, user]);

  const handleReadMessage = async (msg: InboxMessage) => {
    if (!msg.isRead) {
      try {
        await inboxService.markRead(msg.id);
        loadInbox();
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode voucher ${code} berhasil disalin! 🎟️`);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 pb-24 md:pb-0 font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenCartModal={() => onNavigateTo('cart')}
          onNavigateTo={onNavigateTo as any}
        />

        <div className="max-w-3xl mx-auto pt-28 px-6 pb-16 text-left">
          <div className="flex items-center justify-between mb-8 border-b border-neutral-200/60 pb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                📬 Kotak Masuk Anda
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Dapatkan promo khusus, voucher pribadi, dan info terbaru Katsumboo.</p>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={async () => {
                  if (user) {
                    try {
                      await inboxService.markAllRead();
                      toast.success('Semua pesan ditandai telah dibaca.');
                      loadInbox();
                    } catch (err: any) {
                      toast.error(err.message || 'Gagal menandai semua dibaca.');
                    }
                  }
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center space-y-4">
              <span className="text-4xl">🔑</span>
              <p className="text-neutral-500 font-medium">Silakan login untuk mengakses kotak masuk pesan Anda.</p>
              <button
                onClick={() => onNavigateTo('login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Masuk Sekarang ➜
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center space-y-3 py-16">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-400">
                <Mail size={32} />
              </div>
              <h3 className="text-base font-black text-neutral-800">Tidak Ada Pesan</h3>
              <p className="text-xs text-neutral-450 max-w-xs mx-auto leading-relaxed">
                Kotak masuk Anda kosong. Kami akan mengirimkan notifikasi voucher dan promo khusus ke sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => handleReadMessage(msg)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer text-left flex gap-4 items-start ${
                    msg.isRead 
                      ? 'bg-white border-neutral-100/80 opacity-75' 
                      : 'bg-white border-blue-100 shadow-sm ring-2 ring-blue-500/5'
                  }`}
                >
                  <div className={`p-2.5 rounded-2xl shrink-0 ${
                    msg.isRead ? 'bg-neutral-50 text-neutral-400' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-xs font-bold ${msg.isRead ? 'text-neutral-700' : 'text-neutral-900 font-extrabold'}`}>
                        {msg.title}
                      </h4>
                      <span className="text-[9px] text-neutral-400 font-mono shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                      {msg.body}
                    </p>

                    {msg.voucherCode && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-600 border border-blue-100 font-mono text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
                          {msg.voucherCode}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (msg.voucherCode) handleCopyCode(msg.voucherCode);
                          }}
                          className="bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Salin Kode
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <BottomNavigation 
        onOpenCartModal={() => onNavigateTo('cart')} 
        onNavigateTo={onNavigateTo as any} 
        activePage="inbox"
      />
    </div>
  );
};

export default InboxPage;
