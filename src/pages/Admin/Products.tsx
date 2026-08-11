// src/pages/Admin/Products.tsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { menuService } from '../../services/menu';
import type { CategoryObj } from '../../services/menu';
import type { Product, MenuCustomization } from '../../types/menu';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Upload, ImageIcon } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formDesc, setFormDesc] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');  // stores UUID
  const [formImage, setFormImage] = useState('/logokatsu.jpg');
  const [customizations, setCustomizations] = useState<MenuCustomization[]>([]);
  const [imageMode, setImageMode] = useState<'preset' | 'upload'>('preset');
  const [categories, setCategories] = useState<CategoryObj[]>([]); // full objects {id, name}
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berformat gambar (JPG, PNG, WebP, dll).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/webp', 0.7);
        setFormImage(dataUrl);
        toast.success(`Gambar "${file.name}" berhasil diupload & dikompresi!`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDropZone = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const loadData = async () => {
    try {
      const list = await menuService.getProducts();
      setProducts(list);
      const cats = await menuService.getCategoryObjects();
      setCategories(cats);
      // Set default categoryId
      if (cats.length > 0 && !formCategoryId) {
        setFormCategoryId(cats[0].id);
      }
    } catch (e) {
      toast.error('Gagal memuat data produk.');
    }
  };

  useEffect(() => {
    loadData();
    
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleStock = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const next = !product.isAvailable;
      await menuService.toggleAvailability(product.id, next);
      toast.success(`Menu "${product.name}" sekarang ${next ? '✅ Tersedia' : '❌ Habis'}`);
      loadData();
      // Beritahu tab user agar langsung refetch produk
      localStorage.setItem('katsumboo_menu_updated', Date.now().toString());
    } catch (e) {
      toast.error('Gagal mengubah ketersediaan produk.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenEdit = (p: Product) => {
    // Find matching category object by name to get its id
    const catObj = categories.find(c => c.name === p.category);
    setEditingProduct(p);
    setFormName(p.name);
    setFormPrice(p.price);
    setFormDesc(p.desc);
    setFormCategoryId(catObj?.id || categories[0]?.id || '');
    setFormImage(p.image);
    setImageMode(p.image.startsWith('data:') ? 'upload' : 'preset');
    setCustomizations(p.customizations || []);
  };

  const handleOpenAdd = () => {
    setIsAdding(true);
    setFormName('');
    setFormPrice(15000);
    setFormDesc('');
    setFormCategoryId(categories[0]?.id || '');
    setFormImage('/logokatsu.jpg');
    setImageMode('preset');
    setCustomizations([
      { id: 'sambal', name: 'Sambal', options: ['Original', 'Ekstra Pedas', 'No Sambal'], required: true },
      { id: 'salad', name: 'Salad', options: ['Pakai Salad', 'No Salad'], required: true }
    ]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;
    if (!formCategoryId) {
      toast.error('Pilih kategori terlebih dahulu.');
      return;
    }

    const filteredCustomizations = customizations
      .map(c => ({
        ...c,
        name: c.name.trim(),
        options: c.options.map(o => o.trim()).filter(Boolean)
      }))
      .filter(c => c.name && c.options.length > 0);

    try {
      if (editingProduct) {
        // Use updateProductWithCategory to also send categoryId
        await menuService.updateProductWithCategory(
          {
            ...editingProduct,
            name: formName,
            price: Number(formPrice),
            desc: formDesc,
            image: formImage,
            customizations: filteredCustomizations
          },
          formCategoryId
        );
        setEditingProduct(null);
      } else {
        await menuService.createProduct({
          name: formName,
          price: Number(formPrice),
          desc: formDesc,
          categoryId: formCategoryId,
          image: formImage,
          isAvailable: true,
          customizations: filteredCustomizations
        } as any);
        setIsAdding(false);
      }

      toast.success('Produk berhasil disimpan! ✅');
      loadData();
      localStorage.setItem('katsumboo_menu_updated', Date.now().toString());
    } catch (err: any) {
      console.error('Save product error:', err);
      toast.error(`Gagal menyimpan produk: ${err?.message || 'Coba lagi.'}`);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    toast((t) => (
      <span className="text-sm flex flex-col gap-2">
        <strong>Hapus "{name}" dari katalog?</strong>
        <span className="text-xs text-neutral-500">Tindakan ini tidak bisa dibatalkan.</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingId = toast.loading('Menghapus produk...');
              try {
                await menuService.deleteProduct(id);
                toast.dismiss(loadingId);
                toast.success(`"${name}" berhasil dihapus! 🗑️`);
                loadData();
                localStorage.setItem('katsumboo_menu_updated', Date.now().toString());
              } catch (err: any) {
                toast.dismiss(loadingId);
                console.error('Delete product error:', err);
                toast.error(`Gagal menghapus: ${err?.message || 'Coba lagi.'}`);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Ya, Hapus
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-neutral-200 text-neutral-700 text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            Batal
          </button>
        </div>
      </span>
    ), { duration: 10000, icon: '🗑️' });
  };

  const handleAddCategory = async () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (categories.some(c => c.name === trimmed)) {
      toast.error('Kategori sudah ada.');
      return;
    }
    try {
      await menuService.saveCategories([trimmed]);
      toast.success(`Kategori "${trimmed}" ditambahkan!`);
      setNewCatInput('');
      loadData();
    } catch (e) {
      toast.error('Gagal menambah kategori.');
    }
  };

  const handleDeleteCategory = async (catObj: CategoryObj) => {
    const usageCount = products.filter(p => p.category === catObj.name).length;
    if (usageCount > 0) {
      toast.error(`Kategori "${catObj.name}" tidak bisa dihapus karena masih digunakan oleh ${usageCount} menu.`);
      return;
    }
    try {
      await menuService.deleteCategory(catObj.id || catObj.name);
      toast.success(`Kategori "${catObj.name}" berhasil dihapus! 🗑️`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus kategori.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-left text-neutral-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            🍱 Manajemen Menu
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">Tambah, ubah, atau atur ketersediaan menu Katsu.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setShowCategoryManager(true)}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-105"
          >
            📂 Kelola Kategori
          </button>
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" /> Menu Baru
          </button>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-850 text-neutral-400 uppercase tracking-wider text-[9px] font-bold border-b border-neutral-800/80">
              <tr>
                <th className="p-5">Gambar</th>
                <th className="p-5">Nama Menu</th>
                <th className="p-5">Kategori</th>
                <th className="p-5">Harga</th>
                <th className="p-5">Ketersediaan</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-12 h-12 object-cover rounded-xl border border-neutral-800 shrink-0" 
                    />
                  </td>
                  <td className="p-4 font-bold text-white max-w-[200px]">
                    <span className="block truncate">{p.name}</span>
                    <span className="text-[10px] text-neutral-500 font-normal line-clamp-1 mt-0.5">{p.desc}</span>
                    {p.customizations && p.customizations.length > 0 && (
                      <span className="inline-block bg-neutral-850 text-neutral-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md mt-1 border border-neutral-800">
                        {p.customizations.map(c => c.name).join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-neutral-400">
                    {typeof p.category === 'object' && p.category !== null ? (p.category as any).name : String(p.category || '')}
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-400">Rp {p.price.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStock(p)}
                      disabled={togglingId === p.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-wait ${
                        p.isAvailable 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 cursor-pointer' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 cursor-pointer'
                      }`}
                    >
                      {togglingId === p.id ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : p.isAvailable ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {togglingId === p.id ? 'Menyimpan...' : p.isAvailable ? 'Tersedia' : 'Habis'}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleOpenEdit(p)}
                        className="text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editingProduct || isAdding) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveProduct}
            className="bg-neutral-900 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left border border-neutral-800 max-h-[90vh] overflow-y-auto"
          >
            <button 
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsAdding(false);
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-white mb-1 uppercase tracking-wider">
              {editingProduct ? '📝 Edit Menu Katsu' : '🍱 Tambah Menu Baru'}
            </h3>
            <p className="text-[10px] text-neutral-400 mb-6">Lengkapi data produk di bawah untuk di-publish.</p>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Nama Menu</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Mozzarella Beef Katsu"
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Harga (Rupiah)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={e => setFormPrice(Number(e.target.value))}
                    placeholder="Contoh: 28000"
                    className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Kategori</label>
                  <select
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Gambar Menu</label>
                  {/* Toggle mode */}
                  <div className="flex gap-1 text-[8px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageMode('preset')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${imageMode === 'preset' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                    >
                      Preset
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2 py-0.5 rounded-lg transition-all ${imageMode === 'upload' ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-white'}`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {imageMode === 'preset' ? (
                  <select
                    value={formImage.startsWith('data:') ? '/logokatsu.jpg' : formImage}
                    onChange={e => setFormImage(e.target.value)}
                    className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600"
                  >
                    <option value="/nasigoreng.png">Nasi Goreng Katsu (/nasigoreng.png)</option>
                    <option value="/spageti.png">Spaghetti Katsu (/spageti.png)</option>
                    <option value="/logokatsu.jpg">Logo Katsu (/logokatsu.jpg)</option>
                  </select>
                ) : (
                  <div>
                    {/* Drop Zone */}
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDropZone}
                      className="relative w-full h-36 border-2 border-dashed border-neutral-700 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group bg-neutral-950 overflow-hidden"
                    >
                      {formImage && formImage.startsWith('data:') ? (
                        <>
                          <img
                            src={formImage}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          />
                          <div className="relative z-10 flex flex-col items-center gap-1 bg-black/40 px-3 py-2 rounded-xl">
                            <Upload className="w-4 h-4 text-white" />
                            <span className="text-[9px] font-bold text-white">Klik / Drag untuk ganti gambar</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-neutral-500 group-hover:text-blue-400 transition-colors">
                          <ImageIcon className="w-8 h-8" />
                          <p className="text-[10px] font-bold text-center">
                            Klik atau seret gambar ke sini<br />
                            <span className="text-neutral-600 font-normal">JPG, PNG, WebP • Maks 5MB</span>
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Hidden file input */}
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    {formImage && formImage.startsWith('data:') && (
                      <button
                        type="button"
                        onClick={() => { setFormImage('/logokatsu.jpg'); }}
                        className="mt-2 text-[9px] text-red-400 hover:text-red-300 font-bold cursor-pointer"
                      >
                        ✕ Hapus gambar yang diupload
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Deskripsi Menu</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Terangkan bahan utama, rasa, dan keunikan menu..."
                  className="w-full p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-600 h-16 resize-none"
                  required
                />
              </div>

              {/* Customizations Section */}
              <div className="border-t border-neutral-800 pt-4 mt-2">
                <h4 className="font-extrabold text-[9px] uppercase tracking-wider text-neutral-450 mb-2 flex justify-between items-center">
                  <span>⚙️ Pilihan Kustomisasi Menu (e.g. Sambal, Salad)</span>
                  <button
                    type="button"
                    onClick={() => setCustomizations([...customizations, { id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name: '', options: [''], required: true }])}
                    className="text-blue-500 hover:text-blue-400 font-bold"
                  >
                    + Tambah
                  </button>
                </h4>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {customizations.map((cust, idx) => (
                    <div key={cust.id} className="bg-neutral-950 p-3 rounded-xl border border-neutral-850 space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nama Kustomisasi (e.g. Sambal)"
                          value={cust.name}
                          onChange={(e) => {
                            const updated = [...customizations];
                            updated[idx].name = e.target.value;
                            setCustomizations(updated);
                          }}
                          className="bg-transparent border-b border-neutral-800 focus:border-blue-600 outline-none text-xs font-bold text-white w-2/3"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setCustomizations(customizations.filter((_, i) => i !== idx))}
                          className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Pilihan (e.g. Original, Ekstra Pedas, No Sambal)"
                          value={cust.options.join(', ')}
                          onChange={(e) => {
                            const updated = [...customizations];
                            updated[idx].options = e.target.value.split(',').map(s => s.trim());
                            setCustomizations(updated);
                          }}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-[10px] text-neutral-350 focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  {customizations.length === 0 && (
                    <p className="text-[10px] text-neutral-500 italic text-center py-2">Tidak ada kustomisasi untuk menu ini.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4"
              >
                ✓ Simpan Makanan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Kelola Kategori */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left border border-neutral-800">
            <button 
              type="button"
              onClick={() => setShowCategoryManager(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-white mb-1 uppercase tracking-wider flex items-center gap-1.5">
              📂 Kelola Kategori Menu
            </h3>
            <p className="text-[10px] text-neutral-400 mb-5">Tambah atau hapus kategori untuk pengelompokan menu di aplikasi pelanggan.</p>

            {/* List Kategori */}
            <div className="space-y-2 max-h-56 overflow-y-auto mb-5 pr-1">
              {categories.map((cat) => {
                const count = products.filter(p => p.category === cat.name).length;
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-850 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-white block">{cat.name}</span>
                      <span className="text-[9px] text-neutral-500 font-medium block mt-0.5">{count} menu terdaftar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-neutral-500 italic text-center py-4">Belum ada kategori yang dibuat.</p>
              )}
            </div>

            {/* Form Tambah Kategori */}
            <div className="space-y-2 border-t border-neutral-850 pt-4">
              <label className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Tambah Kategori Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: Ricebowl, Dessert"
                  value={newCatInput}
                  onChange={e => setNewCatInput(e.target.value)}
                  className="flex-1 p-2.5 bg-neutral-950 border border-neutral-850 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;