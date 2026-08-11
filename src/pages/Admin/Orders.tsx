// src/pages/Admin/Orders.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order';
import { courierService } from '../../services/courier';
import type { Order } from '../../types/order';
import type { Courier } from '../../types/courier';
import { MapPin, Truck, Check, X, Loader2, Send } from 'lucide-react';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Pending' | 'Cooking' | 'Shipping' | 'Done'>('Semua');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const loadOrders = async () => {
    try {
      const list = await orderService.getAllOrdersAdmin();
      setOrders(list);
    } catch {
      setOrders([]);
    }
  };

  const loadCouriers = async () => {
    try {
      const list = await courierService.getCouriers();
      const activeCouriers = list.filter(c => c.isActive);
      setCouriers(activeCouriers);
      if (activeCouriers.length > 0) {
        setSelectedCourierId(activeCouriers[0].id);
      }
    } catch {
      setCouriers([]);
    }
  };

  useEffect(() => {
    loadOrders();
    loadCouriers();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: Order['status'], courierName?: string, courierPhone?: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status, courierName, courierPhone);
      
      const pushMsg = `🔔 Pesanan ${orderId} diubah menjadi: ${
        status === 'Cooking' ? 'Sedang Dimasak' : status === 'Shipping' ? 'Sedang Diantar' : status === 'Completed' ? 'Selesai' : 'Dibatalkan'
      }`;
      localStorage.setItem('katsumboo_pending_push', pushMsg);
      
      loadOrders();
    } catch (e) {
      toast.error('Gagal mengupdate status pesanan.');
    }
  };

  const handleOpenDispatch = (order: Order) => {
    setSelectedOrderForDispatch(order);
    loadCouriers();
  };

  const handleConfirmDispatch = async () => {
    if (!selectedOrderForDispatch) return;

    if (!selectedCourierId) {
      toast.error('Silakan buat dan aktifkan kurir terlebih dahulu di tab Kurir.');
      return;
    }

    const courier = couriers.find(c => c.id === selectedCourierId);
    if (!courier) {
      toast.error('Kurir tidak ditemukan.');
      return;
    }

    setDispatchLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      await handleUpdateStatus(
        selectedOrderForDispatch.id, 
        'Shipping', 
        courier.name, 
        courier.phone
      );
      setSelectedOrderForDispatch(null);
      toast.success('Kurir berhasil ditugaskan & pesanan dikirim!');
    } catch (e) {
      toast.error('Gagal mengirim kurir.');
    } finally {
      setDispatchLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Pending') return order.status === 'Pending';
    if (activeTab === 'Cooking') return order.status === 'Cooking';
    if (activeTab === 'Shipping') return order.status === 'Shipping';
    return order.status === 'Completed' || order.status === 'Cancelled';
  });

  return (
    <div className="space-y-6 font-sans text-left text-neutral-200">
      <div>
        <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          🔔 Pesanan Masuk
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">Daftar antrean pesanan kuliner aktif dan riwayat pemesanan.</p>
      </div>

      <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 w-fit text-xs font-bold">
        {[
          { id: 'Semua', label: 'Semua' },
          { id: 'Pending', label: 'Menunggu Konfirmasi' },
          { id: 'Cooking', label: 'Dapur (Sedang Dimasak)' },
          { id: 'Shipping', label: 'Sedang Diantar' },
          { id: 'Done', label: 'Riwayat Selesai' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white font-extrabold shadow' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-3xl text-center text-neutral-500">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-xs font-bold">Tidak ada pesanan dalam kategori ini.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 text-xs text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold px-2 py-0.5 rounded text-[10px]">
                    {order.id}
                  </span>
                  <span className="text-neutral-500">
                    {new Date(order.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} {new Date(order.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    order.status === 'Cooking' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    order.status === 'Shipping' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    order.status === 'Completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="text-neutral-400 space-y-1">
                  <p>Pelanggan: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})</p>
                  <p className="flex items-center gap-1"><MapPin size={12} /> {order.address}</p>
                  <p>Metode Pembayaran: <strong className="text-blue-400 font-bold">{order.paymentMethod}</strong> ({order.paymentStatus})</p>
                </div>

                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-850 space-y-1 mt-2">
                  {(order.items || []).map((item, idx) => {
                    const customDesc = [
                      item.selectedSauce && item.selectedSauce !== 'None' && item.selectedSauce !== '' ? `Saus: ${item.selectedSauce}` : null,
                      item.levelPedas !== undefined && item.levelPedas > 0 ? `Lvl: ${item.levelPedas}` : null,
                      ...(item.selectedCustomizations 
                        ? Object.entries(item.selectedCustomizations).map(([k, v]) => `${k}: ${v}`)
                        : [])
                    ].filter(Boolean).join(', ');

                    return (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span>
                          {item.quantity}x {item.name}{' '}
                          {customDesc && <span className="text-neutral-500">({customDesc})</span>}
                        </span>
                        <span className="font-bold text-neutral-350">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {order.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Cooking')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Check size={12} /> Terima Order
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                      className="bg-neutral-800 hover:bg-red-900 border border-neutral-700 text-neutral-400 hover:text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <X size={12} /> Tolak
                    </button>
                  </>
                )}

                {order.status === 'Cooking' && (
                  <button
                    onClick={() => handleOpenDispatch(order)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Truck size={12} /> Kirim Kurir ➜
                  </button>
                )}

                {order.status === 'Shipping' && (
                  <div className="text-[10px] text-neutral-400 bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 text-left space-y-1">
                    <p className="font-bold text-white">🚚 Pengiriman Aktif</p>
                    <p>Kurir: {order.courierName}</p>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Completed')}
                      className="w-full bg-green-600 hover:bg-green-750 text-white font-bold py-1.5 px-3 rounded-lg mt-2 cursor-pointer uppercase text-[9px] tracking-wider text-center"
                    >
                      Tandai Selesai ✓
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left border border-neutral-800">
            <button 
              onClick={() => setSelectedOrderForDispatch(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-white mb-1 uppercase tracking-wider">
              🏍️ Dispatch Kurir Katsumboo
            </h3>
            <p className="text-[10px] text-neutral-400 mb-6">Pilih kurir aktif untuk mengirimkan order {selectedOrderForDispatch.id}.</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Pilih Kurir Aktif
                </label>
                {couriers.length > 0 ? (
                  <select
                    value={selectedCourierId}
                    onChange={e => setSelectedCourierId(e.target.value)}
                    className="w-full p-3 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  >
                    {couriers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.vehicleType} - {c.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-[10px] leading-relaxed">
                    ⚠️ Tidak ada kurir aktif. Silakan buat/aktifkan kurir terlebih dahulu di panel Kurir Admin.
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirmDispatch}
                disabled={dispatchLoading || couriers.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dispatchLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={12} />}
                {dispatchLoading ? 'Dispatching...' : 'Konfirmasi Kirim ➜'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;