// src/pages/Admin/index.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dashboard } from './Dashboard';
import { Products } from './Products';
import { Orders } from './Orders';
import { Finance } from './Finance';
import { Vouchers } from './Vouchers';
import { Couriers } from './Couriers';
import { Promos } from './Promos';

interface AdminProps {
  onNavigateTo: (page: 'home') => void;
}

export const AdminIndex: React.FC<AdminProps> = ({ onNavigateTo }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'vouchers' | 'couriers' | 'finance' | 'promos'>('dashboard');

  // Guard: Hanya izinkan user dengan role === 'admin' untuk melihat Halaman Admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-2xl">
            🚫
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Akses Ditolak</h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Halaman ini khusus untuk Akun Administrator Katsumboo.<br />
              Akun Anda (<strong className="text-blue-400">{user?.email || 'Belum Login'}</strong>) adalah akun Pelanggan (Customer).
            </p>
          </div>
          <button
            onClick={() => onNavigateTo('home')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-md"
          >
            ← Kembali ke Halaman Utama Toko
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex font-sans text-left">
      {/* Sidebar Panel Admin */}
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-black tracking-tight text-blue-500 uppercase">Katsumboo Admin</h2>
            <p className="text-[10px] text-neutral-500 mt-0.5">Control Center v1.0</p>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'dashboard', label: '📊 Dashboard Overview' },
              { id: 'products', label: '🍱 Manajemen Menu' },
              { id: 'orders', label: '🔔 Pesanan Masuk' },
              { id: 'promos', label: '🎯 Promo & Banner' },
              { id: 'vouchers', label: '🎟️ Voucher & Promo' },
              { id: 'couriers', label: '🏍️ Manajemen Kurir' },
              { id: 'finance', label: '💰 Laporan RAB & Finansial' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={() => onNavigateTo('home')}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold py-3 rounded-xl transition-all border border-neutral-700 text-center cursor-pointer"
        >
          ← Keluar ke Toko
        </button>
      </aside>

      {/* Konten Utama Sub-Halaman Admin */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'products' && <Products />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'vouchers' && <Vouchers />}
        {activeTab === 'couriers' && <Couriers />}
        {activeTab === 'finance' && <Finance />}
        {activeTab === 'promos' && <Promos />}
      </main>
    </div>
  );
};

export default AdminIndex;