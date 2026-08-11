// src/pages/History/index.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import type { Order } from '../../types/order';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/Footer';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { Star, Clock, ShoppingCart, AlertTriangle } from 'lucide-react';

interface HistoryProps {
  onNavigateTo: (page: 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'history' | 'profile' | 'tracking') => void;
}

export const History: React.FC<HistoryProps> = ({ onNavigateTo }) => {
  const { isLoggedIn, user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }
    try {
      const userOrders = await orderService.getOrders();
      setOrders(userOrders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn, user]);

  const handleReorder = (orderToCopy: Order) => {
    // Copy each item from the past order directly into the shopping cart
    orderToCopy.items.forEach(item => {
      addToCart({
        ...item,
        quantity: item.quantity // Preserving the quantities
      });
    });
    toast.success('Menu favorit Anda berhasil dimasukkan kembali ke keranjang belanja! 🛒', { duration: 3000 });
    onNavigateTo('cart');
  };

  // Helper for status badge formatting
  const getStatusBadge = (status: Order['status']) => {
    if (status === 'Pending') {
      return <span className="bg-amber-500/10 text-amber-600 border border-amber-200/50 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Menunggu</span>;
    }
    if (status === 'Cooking') {
      return <span className="bg-blue-500/10 text-blue-600 border border-blue-200/50 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-sans">Dimasak</span>;
    }
    if (status === 'Shipping') {
      return <span className="bg-indigo-500/10 text-indigo-600 border border-indigo-200/50 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Diantar</span>;
    }
    if (status === 'Completed') {
      return <span className="bg-green-500/10 text-green-600 border border-green-200/50 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Selesai</span>;
    }
    return <span className="bg-red-500/10 text-red-600 border border-red-200/50 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Dibatalkan</span>;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 pb-24 md:pb-0 font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenCartModal={() => onNavigateTo('cart')}
          onNavigateTo={onNavigateTo as any}
        />

        <div className="max-w-4xl mx-auto pt-28 px-6 pb-16 text-left">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tight text-neutral-900 flex items-center gap-2">
            📋 Riwayat Belanja Anda
          </h2>

          {!isLoggedIn ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center space-y-4">
              <span className="text-4xl">🔒</span>
              <p className="text-neutral-500 font-medium">Silakan login untuk melihat riwayat pembelian kuliner Anda.</p>
              <button
                onClick={() => onNavigateTo('login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Masuk Akun ➜
              </button>
            </div>
          ) : loading ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center space-y-4">
              <span className="text-4xl">📭</span>
              <p className="text-neutral-500 font-medium">Belum ada catatan transaksi belanja kuliner di akun Anda.</p>
              <button
                onClick={() => onNavigateTo('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Jelajah Menu Makanan ➜
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden text-left"
                >
                  {/* Heading Summary Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4 mb-4 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-extrabold text-neutral-800 font-mono text-sm">{item.id}</span>
                      <span className="text-neutral-400 font-medium">
                        {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    
                    <span className="font-bold text-blue-600 text-sm">
                      Rp {item.grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-3 mb-6">
                    {item.items.map((prod, pIdx) => (
                      <div key={pIdx} className="flex justify-between items-start gap-4 text-xs">
                        <div>
                          <p className="font-bold text-neutral-800">{prod.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {prod.quantity}x • {[
                              prod.selectedSauce && prod.selectedSauce !== 'None' && prod.selectedSauce !== '' ? `Saus: ${prod.selectedSauce}` : null,
                              prod.levelPedas !== undefined && prod.levelPedas > 0 ? `Lvl: ${prod.levelPedas}` : null,
                              ...(prod.selectedCustomizations 
                                ? Object.entries(prod.selectedCustomizations).map(([k, v]) => `${k}: ${v}`)
                                : [])
                            ].filter(Boolean).join(' • ')}
                          </p>
                        </div>
                        <span className="text-neutral-500 font-medium">
                          Rp {(prod.price * prod.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons & Reviews info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-100">
                    {/* Render ulasan review details if exists */}
                    {item.reviews ? (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 ${
                                s <= item.reviews!.rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-200'
                              }`} 
                            />
                          ))}
                        </span>
                        <span className="italic font-medium text-neutral-400 font-serif">
                          &quot;{item.reviews.comment}&quot;
                        </span>
                      </div>
                    ) : item.status === 'Completed' ? (
                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Belum dinilai (Review dapat diisi di Pelacakan)
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> Pesanan sedang diproses toko...
                      </span>
                    )}

                    <div className="flex gap-2 shrink-0">
                      {/* Navigate to tracking page for active tracking if order is not Completed/Cancelled */}
                      {item.status !== 'Completed' && item.status !== 'Cancelled' && (
                        <button
                          onClick={() => {
                            localStorage.setItem('katsumboo_active_order_id', item.id);
                            onNavigateTo('tracking');
                          }}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Lacak Pengantaran ➜
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReorder(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Pesan Lagi
                      </button>
                    </div>
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
        activePage="home"
      />
    </div>
  );
};

export default History;