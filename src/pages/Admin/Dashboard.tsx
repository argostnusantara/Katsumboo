// src/pages/Admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order';
import { menuService } from '../../services/menu';
import type { Order } from '../../types/order';
import { TrendingUp, Clock, Store } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeOpen, setStoreOpen] = useState(true);
  const [stats, setStats] = useState({
    grossRevenue: 0,
    netProfit: 0,
    activeCount: 0,
    completedCount: 0,
    bestSeller: 'Loading...'
  });
  const [weeklySales, setWeeklySales] = useState<{ day: string; amount: number }[]>([]);

  const loadDashboardData = async () => {
    try {
      const allOrders = await orderService.getAllOrdersAdmin();
      const isOpen = await menuService.getStoreOpen();
      setOrders(allOrders);
      setStoreOpen(isOpen);

    // Calculate Today's Stats
    const todayStr = new Date().toDateString();
    
    let gross = 0;
    let completedToday = 0;
    let discount = 0;
    let active = 0;

    allOrders.forEach(o => {
      if (['Pending', 'Cooking', 'Shipping'].includes(o.status)) {
        active++;
      }
      
      const orderDateStr = new Date(o.date).toDateString();
      if (orderDateStr === todayStr && o.status !== 'Cancelled') {
        gross += o.subtotal + o.shippingFee; // omset kotor includes delivery
        discount += o.discount;
        if (o.status === 'Completed') {
          completedToday++;
        }
      }
    });

    // Net profit = (Gross - Delivery - discount) * 0.7 (mock 30% ingredient COGS)
    // For simplicity: Net Profit = Today's Completed order GrandTotals * 0.6
    let net = 0;
    allOrders.forEach(o => {
      const orderDateStr = new Date(o.date).toDateString();
      if (orderDateStr === todayStr && o.status === 'Completed') {
        net += o.grandTotal * 0.65; // 65% net profit margin mock
      }
    });

    // Calculate Best Seller
    const itemCountMap: Record<string, number> = {};
    allOrders.forEach(o => {
      if (o.status === 'Completed') {
        (o.items || []).forEach(item => {
          itemCountMap[item.name] = (itemCountMap[item.name] || 0) + item.quantity;
        });
      }
    });

    let bestItem = 'Belum ada data';
    let maxQty = 0;
    Object.entries(itemCountMap).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        bestItem = `${name} (${qty} porsi)`;
      }
    });

    setStats({
      grossRevenue: gross,
      netProfit: Math.round(net),
      activeCount: active,
      completedCount: completedToday,
      bestSeller: bestItem
    });

    // Calculate Last 7 Days Sales Trend
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const chartData = last7Days.map(date => {
      const dateStr = date.toDateString();
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      const daySales = allOrders
        .filter(o => new Date(o.date).toDateString() === dateStr && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.grandTotal, 0);
      
      return {
        day: dayName,
        amount: daySales
      };
    });

    setWeeklySales(chartData);
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal memuat data dashboard.');
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Re-fetch on local updates
    const handleStorageChange = () => {
      loadDashboardData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggleStore = async () => {
    try {
      const nextState = !storeOpen;
      await menuService.setStoreOpen(nextState);
      setStoreOpen(nextState);
      toast.success(`Outlet Katsumboo berhasil di-set ${nextState ? 'BUKA / ONLINE 🟢' : 'TUTUP / OFFLINE 🔴'}`);
    } catch (e) {
      toast.error('Gagal memperbarui status toko');
    }
  };

  // Find max sales for chart heights percentage calculation
  const maxSales = Math.max(...weeklySales.map(s => s.amount), 100000);

  return (
    <div className="space-y-6 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            📊 Dashboard Overview
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Ringkasan performa penjualan outlet Katsumboo hari ini.</p>
        </div>

        {/* Operational Toggle */}
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl flex items-center justify-between gap-4 w-fit shrink-0">
          <div className="flex items-center gap-2">
            <Store className={`w-4 h-4 ${storeOpen ? 'text-green-500' : 'text-red-500'}`} />
            <div>
              <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Status Operasional</span>
              <span className="text-xs font-black text-white">{storeOpen ? 'Toko Buka (Online)' : 'Toko Tutup (Offline)'}</span>
            </div>
          </div>
          <button
            onClick={handleToggleStore}
            className={`text-[10px] font-black py-1.5 px-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
              storeOpen 
                ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {storeOpen ? 'Tutup Toko' : 'Buka Toko'}
          </button>
        </div>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Omset Kotor Hari Ini</span>
            <h4 className="text-xl font-black text-blue-500 mt-1">Rp {stats.grossRevenue.toLocaleString('id-ID')}</h4>
            <span className="text-[8px] text-neutral-500 block mt-1">Selesai + diproses (bukan batal)</span>
          </div>
          <span className="text-base bg-blue-500/10 p-2 rounded-xl text-blue-400">💵</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Estimasi Profit Bersih</span>
            <h4 className="text-xl font-black text-green-500 mt-1">Rp {stats.netProfit.toLocaleString('id-ID')}</h4>
            <span className="text-[8px] text-neutral-500 block mt-1">Estimasi 65% margin order selesai</span>
          </div>
          <span className="text-base bg-green-500/10 p-2 rounded-xl text-green-400">📈</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Pesanan Diproses</span>
            <h4 className="text-xl font-black text-amber-500 mt-1">{stats.activeCount} Antrean</h4>
            <span className="text-[8px] text-neutral-500 block mt-1">Menunggu, dimasak, diantar</span>
          </div>
          <span className="text-base bg-amber-500/10 p-2 rounded-xl text-amber-400">🔔</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Menu Terlaris (All-Time)</span>
            <h4 className="text-sm font-black text-white mt-2 truncate max-w-[150px]">{stats.bestSeller}</h4>
            <span className="text-[8px] text-neutral-500 block mt-1">Porsi terakumulasi terjual</span>
          </div>
          <span className="text-base bg-purple-500/10 p-2 rounded-xl text-purple-400">🔥</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly sales trend chart */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl lg:col-span-2 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Grafik Tren Penjualan 7 Hari Terakhir
          </h4>

          {/* Bar Chart Container */}
          <div className="h-48 flex items-end justify-between gap-2.5 pt-4">
            {weeklySales.map((dayData, idx) => {
              const heightPercent = Math.max(5, Math.round((dayData.amount / maxSales) * 100));
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Hover Tooltip tooltip */}
                  <div className="absolute bottom-full mb-2 bg-neutral-800 border border-neutral-700 text-white text-[9px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-md">
                    Rp {dayData.amount.toLocaleString('id-ID')}
                  </div>

                  {/* Chart Bar */}
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-500 shadow-lg shadow-blue-500/5 cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Day label */}
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">{dayData.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Active Orders Listing */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Antrean Pesanan Aktif
            </h4>
            <p className="text-[10px] text-neutral-500 mt-1">Harap segera terima dan masak untuk menjaga kepuasan pelanggan.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[140px] divide-y divide-neutral-800/60 pt-2 space-y-2">
            {orders.filter(o => ['Pending', 'Cooking', 'Shipping'].includes(o.status)).slice(0, 3).length === 0 ? (
              <p className="text-[10px] text-neutral-500 py-6 text-center italic">Tidak ada antrean pesanan aktif saat ini.</p>
            ) : (
              orders.filter(o => ['Pending', 'Cooking', 'Shipping'].includes(o.status)).slice(0, 3).map(order => (
                <div key={order.id} className="pt-2 first:pt-0 flex justify-between items-center text-[11px]">
                  <div>
                    <span className="font-bold text-white block">{order.id}</span>
                    <span className="text-neutral-500 text-[10px] block mt-0.5 max-w-[150px] truncate">
                      {(order.items || []).map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                    order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : order.status === 'Cooking' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {order.status === 'Pending' ? 'Menunggu' : order.status === 'Cooking' ? 'Dapur' : 'Kurir'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;