// src/pages/Admin/Promos.tsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { menuService } from '../../services/menu';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, X, Check } from 'lucide-react';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  isActive: boolean;
}

const emptyBanner = (): Omit<PromoBanner, 'id'> => ({
  title: '',
  subtitle: '',
  image: '',
  isActive: true,
});

export const Promos: React.FC = () => {
  const [promos, setPromos] = useState<PromoBanner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromoBanner | null>(null);
  const [form, setForm] = useState(emptyBanner());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const data = await menuService.getPromos();
    setPromos(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berformat gambar.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/webp', 0.75);
        setForm(f => ({ ...f, image: dataUrl }));
        toast.success('Gambar berhasil diupload!');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyBanner());
    setShowForm(true);
  };

  const openEdit = (banner: PromoBanner) => {
    setEditing(banner);
    setForm({ title: banner.title, subtitle: banner.subtitle, image: banner.image, isActive: banner.isActive });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Judul promo harus diisi!'); return; }
    if (!form.subtitle.trim()) { toast.error('Deskripsi promo harus diisi!'); return; }

    let updated: PromoBanner[];
    if (editing) {
      updated = promos.map(p => p.id === editing.id ? { ...p, ...form } : p);
    } else {
      const newBanner: PromoBanner = { id: `promo-${Date.now()}`, ...form };
      updated = [...promos, newBanner];
    }
    await menuService.savePromos(updated);
    setPromos(updated);
    setShowForm(false);
    toast.success(editing ? 'Promo berhasil diperbarui!' : 'Promo baru berhasil ditambahkan!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus promo ini?')) return;
    const updated = promos.filter(p => p.id !== id);
    await menuService.savePromos(updated);
    setPromos(updated);
    toast.success('Promo dihapus!');
  };

  const toggleActive = async (id: string) => {
    const updated = promos.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
    await menuService.savePromos(updated);
    setPromos(updated);
    toast.success('Status promo diperbarui!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-black text-white">🎯 Manajemen Promo & Banner</h2>
          <p className="text-xs text-neutral-400 mt-1">Kelola konten slider promo di halaman utama pelanggan.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Promo
        </button>
      </div>

      {/* Banner list */}
      <div className="space-y-4">
        {promos.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-bold">Belum ada promo banner</p>
            <p className="text-xs mt-1">Klik "Tambah Promo" untuk menambahkan konten baru.</p>
          </div>
        )}
        {promos.map((banner, idx) => (
          <div key={banner.id} className={`bg-neutral-900 border rounded-2xl p-4 flex gap-4 items-start transition-all ${banner.isActive ? 'border-blue-800/40' : 'border-neutral-800 opacity-60'}`}>
            {/* Order badge */}
            <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 font-black text-sm shrink-0">
              {idx + 1}
            </div>

            {/* Image preview */}
            <div className="w-20 h-16 bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 shrink-0 flex items-center justify-center">
              {banner.image ? (
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-neutral-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-900/50 text-green-400 border border-green-800' : 'bg-neutral-800 text-neutral-500'}`}>
                  {banner.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <h4 className="font-black text-white text-sm truncate">{banner.title}</h4>
              <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{banner.subtitle}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleActive(banner.id)}
                title={banner.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                className={`p-2 rounded-lg cursor-pointer transition ${banner.isActive ? 'text-green-400 hover:bg-green-900/20' : 'text-neutral-500 hover:bg-neutral-800'}`}
              >
                {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => openEdit(banner)}
                className="p-2 rounded-lg text-blue-400 hover:bg-blue-900/20 cursor-pointer transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-900/20 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-white">{editing ? 'Edit Promo Banner' : 'Tambah Promo Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image uploader */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Gambar Banner (Opsional)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 bg-neutral-800 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition overflow-hidden relative group"
                >
                  {form.image ? (
                    <>
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-white text-xs font-bold">Ganti Gambar</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-neutral-600 mb-2" />
                      <span className="text-xs text-neutral-500">Klik untuk upload gambar</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Judul / Tag Promo *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Contoh: PROMO MINGGU INI"
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm font-bold px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Deskripsi Promo *</label>
                <textarea
                  value={form.subtitle}
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Jelaskan detail promo atau bundling paket..."
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? 'bg-blue-600' : 'bg-neutral-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-xs font-bold text-neutral-300">Tampilkan di halaman utama</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl cursor-pointer transition"
              >
                <Check className="w-4 h-4" /> Simpan Promo
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-sm py-3 rounded-xl cursor-pointer transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promos;
