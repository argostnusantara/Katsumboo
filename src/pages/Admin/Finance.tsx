// src/pages/Admin/Finance.tsx
import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/order';
import type { Order } from '../../types/order';
import { Calendar, Download, Printer, BarChart2 } from 'lucide-react';

export const Finance: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Default to last 7 days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadFinanceData = async () => {
    try {
      const allOrders = await orderService.getAllOrdersAdmin();
      setOrders(allOrders);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadFinanceData();

    const handleStorageChange = () => {
      loadFinanceData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter orders by date range and status (Completed only)
  const filteredOrders = orders.filter(o => {
    if (o.status !== 'Completed') return false;
    
    const orderDate = new Date(o.date).toISOString().split('T')[0];
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculations
  let totalGross = 0; // Omset Kotor (subtotal + shipping)
  let totalDiscount = 0; // Potongan voucher
  let totalShipping = 0; // Ongkos kirim
  let totalNetProfit = 0; // Pendapatan bersih

  // Platform performance buckets
  const platformStats: Record<string, { omset: number; count: number }> = {
    'Katsumboo Direct': { omset: 0, count: 0 },
    'GoFood': { omset: 0, count: 0 },
    'ShopeeFood': { omset: 0, count: 0 }
  };

  filteredOrders.forEach(o => {
    totalGross += o.subtotal + o.shippingFee;
    totalDiscount += o.discount;
    totalShipping += o.shippingFee;
    
    // Net profit = (subtotal * 0.65) - discount (65% margin on raw food value after voucher subtractions)
    const orderNet = (o.subtotal * 0.65) - o.discount;
    totalNetProfit += orderNet;

    // Platform categorisation
    const p = o.platform || 'Katsumboo Direct';
    if (platformStats[p]) {
      platformStats[p].omset += o.grandTotal;
      platformStats[p].count += 1;
    }
  });

  // Helper filters presets
  const handleFilterPreset = (preset: 'today' | '7days' | 'month' | 'all') => {
    const today = new Date().toISOString().split('T')[0];
    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    } else if (preset === 'month') {
      const d = new Date();
      d.setDate(1); // First day of current month
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(today);
    } else {
      setStartDate('2026-01-01');
      setEndDate(today);
    }
  };

  // Export CSV Helper (for Excel)
  const handleExportCSV = () => {
    const headers = ['ID Pesanan', 'Tanggal', 'Nama Pelanggan', 'Platform', 'Subtotal', 'Diskon', 'Ongkir', 'Total Bersih', 'Pembayaran'];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.date).toLocaleDateString('id-ID'),
      o.customerName,
      o.platform,
      o.subtotal,
      o.discount,
      o.shippingFee,
      o.grandTotal,
      o.paymentMethod
    ]);

    // CSV compile with headers & rows join
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // UTF-8 BOM for Excel double clicks
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `katsumboo_laporan_keuangan_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger print view (styled with Tailwind print tags)
  const handlePrintPDF = () => {
    window.print();
  };

  const totalPlatformOmset = Object.values(platformStats).reduce((sum, p) => sum + p.omset, 0) || 1;

  return (
    <div className="space-y-6 font-sans text-left text-neutral-200 print:bg-white print:text-neutral-900">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6 print:border-neutral-200">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white print:text-neutral-900 flex items-center gap-2">
            💰 Laporan Finansial & Omset
          </h3>
          <p className="text-xs text-neutral-400 print:text-neutral-500 mt-0.5">Analisis omset kotor, potongan diskon, dan profit margin bersih.</p>
        </div>

        {/* Actions buttons */}
        <div className="flex gap-2 shrink-0 print:hidden">
          <button 
            onClick={handleExportCSV}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-[10px] py-2.5 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-700 shadow-md"
          >
            <Download className="w-3.5 h-3.5" /> Export Excel (.csv)
          </button>
          <button 
            onClick={handlePrintPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-2.5 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak PDF Laporan
          </button>
        </div>
      </div>

      {/* Date Filters Area */}
      <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-bold text-neutral-400">Preset Rentang Tanggal:</span>
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari Terakhir' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua Laporan' }
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleFilterPreset(preset.id as any)}
                className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-semibold px-3 py-1.5 rounded-lg border border-neutral-750 cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-neutral-200 font-bold focus:outline-none"
            />
            <span className="text-neutral-500 font-bold">s.d</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 p-2 rounded-lg text-neutral-200 font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omset Kotor */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl print:border-neutral-200 print:bg-white text-left">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Total Omset Kotor</span>
          <h4 className="text-xl font-black text-white print:text-neutral-900 mt-1">Rp {totalGross.toLocaleString('id-ID')}</h4>
          <span className="text-[8px] text-neutral-500 block mt-1">Subtotal Makanan + Ongkos Kirim</span>
        </div>

        {/* Potongan Diskon */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl print:border-neutral-200 print:bg-white text-left">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Potongan Voucher Diskon</span>
          <h4 className="text-xl font-black text-red-400 mt-1">- Rp {totalDiscount.toLocaleString('id-ID')}</h4>
          <span className="text-[8px] text-neutral-500 block mt-1">Total diskon voucher terpakai</span>
        </div>

        {/* Ongkir */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl print:border-neutral-200 print:bg-white text-left">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Alokasi Ongkos Kirim</span>
          <h4 className="text-xl font-black text-amber-500 mt-1">Rp {totalShipping.toLocaleString('id-ID')}</h4>
          <span className="text-[8px] text-neutral-500 block mt-1">Alokasi khusus kurir driver</span>
        </div>

        {/* Net Profit */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl print:border-neutral-200 print:bg-white text-left">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Pendapatan Bersih (Net)</span>
          <h4 className="text-xl font-black text-green-400 mt-1">Rp {totalNetProfit.toLocaleString('id-ID')}</h4>
          <span className="text-[8px] text-neutral-500 block mt-1">Est. 65% makanan - potongan diskon</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platforms breakdown analytics */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl lg:col-span-2 space-y-6 print:border-neutral-200 print:bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-600 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-500" /> Analisis Performa Channel Platform
          </h4>

          <div className="space-y-5 text-xs text-left">
            {Object.entries(platformStats).map(([name, stat]) => {
              const sharePercent = Math.round((stat.omset / totalPlatformOmset) * 100);
              
              return (
                <div key={name} className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span className="text-white print:text-neutral-800">{name} ({stat.count} Transaksi)</span>
                    <span className="text-neutral-400 print:text-neutral-600">
                      Rp {stat.omset.toLocaleString('id-ID')} ({sharePercent}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-neutral-950 border border-neutral-850 h-3.5 rounded-full overflow-hidden print:border-neutral-200">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${
                        name === 'Katsumboo Direct' 
                          ? 'from-blue-600 to-blue-400' 
                          : name === 'GoFood' 
                          ? 'from-green-600 to-green-400' 
                          : 'from-amber-600 to-orange-400'
                      }`}
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Transactions List for audit */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4 print:border-neutral-200 print:bg-white text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-600 flex items-center gap-1.5">
            📋 Audit Pesanan Selesai ({filteredOrders.length})
          </h4>

          <div className="space-y-2.5 overflow-y-auto max-h-[160px] divide-y divide-neutral-850 pt-2">
            {filteredOrders.length === 0 ? (
              <p className="text-[10px] text-neutral-500 py-6 text-center italic">Tidak ada audit transaksi pesanan selesai.</p>
            ) : (
              filteredOrders.map(o => (
                <div key={o.id} className="pt-2 first:pt-0 flex justify-between items-center text-[10px]">
                  <div>
                    <span className="font-bold text-white print:text-neutral-800 font-mono block">{o.id}</span>
                    <span className="text-neutral-500 block mt-0.5">
                      {new Date(o.date).toLocaleDateString('id-ID')} • {o.platform}
                    </span>
                  </div>
                  <span className="font-bold text-blue-400">
                    Rp {o.grandTotal.toLocaleString('id-ID')}
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

export default Finance;