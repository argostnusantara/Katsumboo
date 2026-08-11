// src/pages/Admin/Couriers.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { courierService } from '../../services/courier';
import type { Courier } from '../../types/courier';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

export const Couriers: React.FC = () => {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'Motor' | 'Sepeda' | 'Mobil'>('Motor');

  const loadCouriers = async () => {
    try {
      const list = await courierService.getCouriers();
      setCouriers(list);
    } catch {
      setCouriers([]);
    }
  };

  useEffect(() => {
    loadCouriers();
  }, []);

  const handleToggleActive = async (c: Courier) => {
    try {
      await courierService.updateCourier(c.id, { isActive: !c.isActive });
      toast.success(`Kurir ${c.name} di-set ${!c.isActive ? 'Aktif' : 'Nonaktif'}`);
      loadCouriers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal update status kurir.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await courierService.deleteCourier(id);
      toast.success('Kurir berhasil dihapus.');
      loadCouriers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus kurir.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      await courierService.createCourier({
        name: name.trim(),
        phone: phone.trim(),
        vehicleType,
        isActive: true,
      });
      setIsAdding(false);
      setName('');
      setPhone('');
      setVehicleType('Motor');
      toast.success('Kurir baru berhasil didaftarkan!');
      loadCouriers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mendaftarkan kurir.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-left text-neutral-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            🏍️ Manajemen Kurir
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Daftarkan dan kelola kurir katsu untuk pengiriman makanan.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md hover:scale-105"
        >
          <Plus className="w-3.5 h-3.5" /> Kurir Baru
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-850 text-neutral-400 uppercase tracking-wider text-[9px] font-bold border-b border-neutral-800/80">
              <tr>
                <th className="p-5">Nama Kurir</th>
                <th className="p-5">WhatsApp / Phone</th>
                <th className="p-5">Kendaraan</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {couriers.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4 font-bold text-white">{c.name}</td>
                  <td className="p-4 font-semibold text-neutral-400">{c.phone}</td>
                  <td className="p-4 font-semibold text-neutral-400">{c.vehicleType}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        c.isActive 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {c.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {c.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {couriers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium italic">
                    Belum ada kurir terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSave}
            className="bg-neutral-900 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left border border-neutral-800"
          >
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-white mb-1 uppercase tracking-wider">
              🏍️ Tambah Kurir Baru
            </h3>
            <p className="text-[10px] text-neutral-400 mb-6">Daftarkan kurir pengantaran Katsumboo.</p>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nama Kurir</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Kang Asep"
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Contoh: 0812-9988-7766"
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Tipe Kendaraan</label>
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value as any)}
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                >
                  <option value="Motor">Motor 🏍️</option>
                  <option value="Sepeda">Sepeda 🚲</option>
                  <option value="Mobil">Mobil 🚗</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4"
              >
                ✓ Tambahkan Kurir
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Couriers;
