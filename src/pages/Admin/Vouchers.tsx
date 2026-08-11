import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/order';
import { userService } from '../../services/userService';
import type { Voucher } from '../../types/order';
import type { UserAccount } from '../../types/user';
import { Plus, Tag, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Vouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sendingVoucher, setSendingVoucher] = useState<Voucher | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'fixed' | 'percent' | 'free_shipping'>('fixed');
  const [value, setValue] = useState(5000);
  const [minPurchase, setMinPurchase] = useState(20000);
  const [description, setDescription] = useState('');

  const loadData = async () => {
    try {
      const vList = await orderService.getVouchers();
      const uList = await userService.getUsers();
      setVouchers(vList);
      // Filter out admin users
      setUsers(uList.filter(u => u.role !== 'admin' && u.role !== 'ADMIN'));
    } catch {
      setVouchers([]);
      setUsers([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;

    try {
      await orderService.createVoucher({
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minPurchase: Number(minPurchase),
        description: description || `${type === 'fixed' ? 'Diskon Rp' : type === 'percent' ? 'Diskon' : 'Potongan Ongkir'} ${value.toLocaleString('id-ID')}`,
        maxUses: 100,
        usedByUserIds: [],
        sentToUserIds: [],
        createdAt: new Date().toISOString()
      } as any);

      setIsAdding(false);
      setCode('');
      setType('fixed');
      setValue(5000);
      setMinPurchase(20000);
      setDescription('');
      toast.success('Voucher baru berhasil dibuat!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat voucher.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Backend coupons delete
      // Wait, let's write deleteVoucher in orderService
      // If we don't have it, we can just delete it via order service call.
      // Let's add deleteVoucher in orderService first or check if we already have it. We will call it.
      // But wait! Let's check backend endpoint. It is DELETE /coupons/:id
      // Let's define deleteVoucher in orderService: we can do it directly.
      // Let's check order.ts to see if it has it. It has getVouchers, createVoucher. We will add deleteVoucher to orderService in a moment.
      // For now, let's call a general delete or add it.
      // Let's add it.
      const { apiClient } = await import('../../services/apiClient');
      await apiClient.delete(`/coupons/${id}`);
      toast.success('Voucher berhasil dihapus.');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus voucher.');
    }
  };

  const handleOpenSend = (voucher: Voucher) => {
    setSendingVoucher(voucher);
    if (users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  };

  const handleSendVoucher = async () => {
    if (!sendingVoucher || !selectedUserId) return;

    const targetUser = users.find(u => u.id === selectedUserId);
    if (!targetUser) return;

    try {
      await orderService.sendVoucherToUserInbox(sendingVoucher.id, selectedUserId);
      toast.success(`Voucher ${sendingVoucher.code} berhasil dikirim ke inbox ${targetUser.name}!`);
      setSendingVoucher(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim voucher.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-left text-neutral-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            🎟️ Manajemen Voucher & Promo
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Buat, kelola, dan distribusikan kode promo ke inbox pelanggan.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md hover:scale-105"
        >
          <Plus className="w-3.5 h-3.5" /> Voucher Baru
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-850 text-neutral-400 uppercase tracking-wider text-[9px] font-bold border-b border-neutral-800/80">
              <tr>
                <th className="p-5">Kode</th>
                <th className="p-5">Tipe</th>
                <th className="p-5">Nilai / Min Belanja</th>
                <th className="p-5">Deskripsi</th>
                <th className="p-5 text-center">Aksi / Distribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4 font-black text-blue-400 uppercase">{v.code}</td>
                  <td className="p-4 font-semibold text-neutral-400">
                    {v.type === 'fixed' ? 'Nominal Tetap' : v.type === 'percent' ? 'Persentase' : 'Gratis Ongkir'}
                  </td>
                  <td className="p-4 font-medium">
                    Rp {v.value.toLocaleString('id-ID')} / Rp {v.minPurchase.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-neutral-400 max-w-[200px] truncate">{v.description}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleOpenSend(v)}
                        className="text-green-400 hover:text-green-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Kirim ke User
                      </button>
                      <button 
                        onClick={() => handleDelete(v.id)}
                        className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 font-medium italic">
                    Belum ada voucher dibuat.
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
              🎟️ Buat Voucher Baru
            </h3>
            <p className="text-[10px] text-neutral-400 mb-6">Konfigurasi nilai diskon dan minimal belanja promo.</p>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Kode Voucher</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="Contoh: KATSUHEMAT"
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600 uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Tipe Diskon</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  >
                    <option value="fixed">Nominal Tetap (Rp)</option>
                    <option value="percent">Persentase (%)</option>
                    <option value="free_shipping">Gratis Ongkir</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nilai Diskon</label>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    placeholder="Contoh: 10000"
                    className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Minimal Belanja (Rupiah)</label>
                <input
                  type="number"
                  value={minPurchase}
                  onChange={e => setMinPurchase(Number(e.target.value))}
                  placeholder="Contoh: 30000"
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Tampilan</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Biarkan kosong untuk auto-generate deskripsi..."
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600 h-16 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4"
              >
                ✓ Simpan Voucher
              </button>
            </div>
          </form>
        </div>
      )}

      {sendingVoucher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-left border border-neutral-800">
            <button 
              onClick={() => setSendingVoucher(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-white mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={16} className="text-blue-500" /> Kirim Kode: {sendingVoucher.code}
            </h3>
            <p className="text-[10px] text-neutral-400 mb-6">Pilih pelanggan untuk mengirim kode promo ini langsung ke inbox.</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Pilih Pelanggan</label>
                {users.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full p-3 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-400 italic text-[10px]">Belum ada pelanggan terdaftar.</p>
                )}
              </div>

              <button
                onClick={handleSendVoucher}
                disabled={users.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4 disabled:opacity-50"
              >
                <Send size={12} /> Kirim Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers;
