import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/order';
import type { Order } from '../../types/order';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/Footer';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { Clock, CheckCircle, Package, Truck, Star, Phone, MessageSquare, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrackingProps {
  onNavigateTo: (page: 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'history' | 'profile' | 'tracking') => void;
}

export const Tracking: React.FC<TrackingProps> = ({ onNavigateTo }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Countdown timer state
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const fetchActiveOrder = async () => {
    const activeId = localStorage.getItem('katsumboo_active_order_id');
    if (!activeId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    try {
      const activeOrder = await orderService.getOrderById(activeId);
      setOrder(activeOrder);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrder();
  }, []);

  // Tracking timer auto updater and countdown logic
  useEffect(() => {
    if (!order) return;
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      setCountdownSeconds(null);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const latestOrder = await orderService.getOrderById(order.id);
        if (!latestOrder) return;

        const now = new Date().getTime();
        const t = latestOrder.statusTimestamps || {};
        
        let nextStatus: Order['status'] | null = null;
        let remaining = 0;

        if (latestOrder.status === 'Pending') {
          const pendingTime = t.pending ? new Date(t.pending).getTime() : new Date(latestOrder.date).getTime();
          const elapsed = now - pendingTime;
          // 1 minute = 60,000 ms
          remaining = Math.max(0, Math.ceil((60000 - elapsed) / 1000));
          setCountdownSeconds(remaining);

          if (remaining <= 0) {
            nextStatus = 'Cooking';
          }
        } else if (latestOrder.status === 'Cooking') {
          const cookingTime = t.cooking ? new Date(t.cooking).getTime() : now;
          const elapsed = now - cookingTime;
          // 12 minutes = 720,000 ms
          remaining = Math.max(0, Math.ceil((720000 - elapsed) / 1000));
          setCountdownSeconds(remaining);
          // Do not auto transition to Shipping, requires Admin action!
        } else if (latestOrder.status === 'Shipping') {
          const shippingTime = t.shipping ? new Date(t.shipping).getTime() : now;
          const elapsed = now - shippingTime;
          // 40 minutes = 2,400,000 ms
          remaining = Math.max(0, Math.ceil((2400000 - elapsed) / 1000));
          setCountdownSeconds(remaining);

          if (remaining <= 0) {
            nextStatus = 'Completed';
          }
        }

        // If status didn't change but DB status is different, sync locally
        if (latestOrder.status !== order.status) {
          setOrder(latestOrder);
        }

        if (nextStatus) {
          await orderService.updateOrderStatus(latestOrder.id, nextStatus);
          
          const updated = await orderService.getOrderById(latestOrder.id);
          setOrder(updated);

          // Simulated push notification banner
          const pushMsg = `🔔 Pesanan ${latestOrder.id} status berubah menjadi: ${
            nextStatus === 'Cooking' ? 'Sedang Dimasak 🍳' : 'Selesai 🍱'
          }`;
          localStorage.setItem('katsumboo_pending_push', pushMsg);
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error('Error fetching order update in tracking', err);
      }
    }, 3000); // Poll every 3 seconds for backend changes

    return () => clearInterval(interval);
  }, [order]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSubmittingReview(true);
    try {
      await orderService.submitOrderReview(order.id, rating, comment);
      setReviewSubmitted(true);
      
      setTimeout(() => {
        localStorage.removeItem('katsumboo_active_order_id');
        onNavigateTo('history');
      }, 1500);
    } catch (e) {
      toast.error('Gagal mengirim ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusIndex = (status: Order['status']) => {
    if (status === 'Pending') return 0;
    if (status === 'Cooking') return 1;
    if (status === 'Shipping') return 2;
    return 3; // Completed
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const steps = [
    { label: 'Menunggu Konfirmasi', icon: Clock, desc: 'Dapur sedang menerima pesanan Anda. (Durasi: 1 Menit)' },
    { label: 'Sedang Dimasak', icon: Package, desc: 'Daging katsu premium segar Anda sedang digoreng crispy. (Durasi: 12 Menit)' },
    { label: 'Sedang Diantar', icon: Truck, desc: 'Kurir sedang membawa katsu hangat ke tempat Anda. (Durasi: 40 Menit)' },
    { label: 'Selesai', icon: CheckCircle, desc: 'Makanan telah sampai di tangan Anda. Selamat menikmati!' }
  ];

  const currentStepIdx = order ? getStatusIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 pb-24 md:pb-0 font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenCartModal={() => onNavigateTo('cart')}
          onNavigateTo={onNavigateTo as any}
        />

        <div className="max-w-4xl mx-auto pt-28 px-6 pb-16 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-neutral-200/60 pb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
                🏍️ Pelacakan Pesanan Aktif
              </h2>
              {order && (
                <p className="text-xs text-neutral-400 mt-1">
                  ID Transaksi: <strong className="text-neutral-700">{order.id}</strong> • Dipesan pada {new Date(order.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              )}
            </div>
            
            <button
              onClick={() => onNavigateTo('history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Lihat Riwayat Belanja →
            </button>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            </div>
          ) : !order ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center space-y-4">
              <span className="text-4xl">📭</span>
              <p className="text-neutral-500 font-medium">Tidak ada transaksi pesanan aktif yang sedang diproses.</p>
              <button
                onClick={() => onNavigateTo('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
              >
                Pesan Katsu Sekarang ➜
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Visual Step Indicators */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Visual Countdown Box */}
                {countdownSeconds !== null && countdownSeconds > 0 && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-md flex justify-between items-center">
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-blue-200">
                        {order.status === 'Pending' ? 'Menunggu Konfirmasi Toko' : order.status === 'Cooking' ? 'Sedang Dimasak di Dapur' : 'Sedang Diantar Kurir'}
                      </span>
                      <h3 className="text-lg font-black mt-1">Estimasi Selesai Tahap Ini</h3>
                    </div>
                    <div className="font-mono text-3xl font-black bg-black/25 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
                      {formatCountdown(countdownSeconds)}
                    </div>
                  </div>
                )}

                {order.status === 'Cooking' && countdownSeconds === 0 && (
                  <div className="bg-amber-500 text-white p-6 rounded-3xl shadow-md">
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-100">Dapur Katsumboo</span>
                    <h3 className="text-sm font-black mt-1">🍲 Katsu Anda Selesai Dimasak & Siap!</h3>
                    <p className="text-xs text-amber-100 mt-1 leading-relaxed">Menunggu Admin menugaskan kurir pengantar untuk dikirim ke alamat Anda.</p>
                  </div>
                )}

                <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-8">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    
                    return (
                      <div key={idx} className="flex gap-4 relative">
                        {/* Connecting Line */}
                        {idx < steps.length - 1 && (
                          <div 
                            className={`absolute left-5 top-10 w-0.5 h-12 -ml-0.25 ${
                              idx < currentStepIdx ? 'bg-green-500' : 'bg-neutral-100'
                            }`}
                          />
                        )}
                        
                        {/* Icon Node */}
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 transition-all z-10 ${
                            isCompleted 
                              ? 'bg-green-50 text-green-600 border-green-200' 
                              : isActive 
                              ? 'bg-blue-50 text-blue-600 border-blue-200 ring-4 ring-blue-100'
                              : 'bg-neutral-50 text-neutral-400 border-neutral-100'
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        {/* Step content */}
                        <div className="space-y-1">
                          <h4 
                            className={`text-sm font-bold ${
                              isActive ? 'text-blue-600 animate-pulse' : isCompleted ? 'text-green-600' : 'text-neutral-800'
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-[11px] text-neutral-455 font-medium leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rating / Review Card */}
                {order.status === 'Completed' && (
                  <div className="bg-white p-6 rounded-3xl border-2 border-amber-100 shadow-md space-y-4">
                    <div className="flex items-center gap-2 text-amber-500">
                      <Star className="w-5 h-5 fill-amber-500" />
                      <h3 className="font-extrabold text-neutral-900 text-base">Berikan Penilaian & Ulasan</h3>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Bagikan pengalaman kuliner Anda menikmati Chicken Katsu Katsumboo. Penilaian Anda membantu kami terus berkembang!
                    </p>

                    {reviewSubmitted ? (
                      <div className="p-4 bg-green-50 text-green-700 border border-green-100 rounded-2xl text-xs font-bold text-center">
                        🎉 Terima kasih atas ulasan lezat Anda! Mengarahkan ke riwayat...
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                            >
                              <Star 
                                className={`w-8 h-8 ${
                                  star <= rating ? 'text-amber-500 fill-amber-500' : 'text-neutral-200'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Tulis Ulasan Anda</label>
                          <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Contoh: Katsu sangat renyah, saus original gurih manis pas sekali!"
                            className="w-full p-3 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors h-16 resize-none"
                            required
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={submittingReview}
                          className="w-full text-xs font-bold uppercase tracking-wider py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submittingReview ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                          Kirim Ulasan Kami
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Driver Details & Order Summary */}
              <div className="space-y-6">
                {/* Driver Details */}
                {(order.status === 'Shipping' || order.status === 'Completed') && (
                  <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      🏍️ Kurir Pengirim
                    </h4>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-600 text-lg border border-blue-100 shrink-0">
                        👨🏻‍✈️
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-neutral-800 text-sm">{order.courierName || 'Kang Asep'}</h4>
                        <p className="text-[10px] text-neutral-400 font-medium">Kurir Katsumboo</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <a 
                        href={`tel:${order.courierPhone || '081299887766'}`}
                        className="flex-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[10px] py-2 px-3 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Telepon
                      </a>
                      <button 
                        type="button"
                        onClick={() => toast.success('Simulator: Pesan dikirim ke kurir!')}
                        className="flex-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 font-bold text-[10px] py-2 px-3 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    🍱 Rincian Pesanan
                  </h4>

                  <div className="space-y-3 divide-y divide-neutral-50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="pt-2.5 first:pt-0 flex justify-between text-xs text-left">
                        <div className="max-w-[70%]">
                          <span className="font-extrabold text-neutral-800">{item.name}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {item.quantity}x • {[
                              item.selectedSauce && item.selectedSauce !== 'None' && item.selectedSauce !== '' ? `Saus: ${item.selectedSauce}` : null,
                              item.levelPedas !== undefined && item.levelPedas > 0 ? `Lvl: ${item.levelPedas}` : null,
                              ...(item.selectedCustomizations 
                                ? Object.entries(item.selectedCustomizations).map(([k, v]) => `${k}: ${v}`)
                                : [])
                            ].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                        <span className="font-bold text-neutral-700">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 pt-3 space-y-1.5 text-xs text-neutral-500">
                    <div className="flex justify-between"><span>Subtotal:</span><span>Rp {order.subtotal.toLocaleString('id-ID')}</span></div>
                    <div className="flex justify-between"><span>Ongkos Kirim:</span><span>Rp {order.shippingFee.toLocaleString('id-ID')}</span></div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium"><span>Diskon:</span><span>- Rp {order.discount.toLocaleString('id-ID')}</span></div>
                    )}
                    <div className="flex justify-between font-black text-blue-600 text-sm border-t border-neutral-50 pt-2">
                      <span>Total Bayar:</span>
                      <span>Rp {order.grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-neutral-400 space-y-1.5">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-300 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">Alamat: {order.address}</span>
                    </div>
                  </div>
                </div>
              </div>
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

export default Tracking;