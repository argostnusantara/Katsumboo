// src/pages/Profile/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/Footer';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { MapPin, User, Phone, Mail, Camera, ShoppingBag, Star, Shield, Edit3, Check, X } from 'lucide-react';
import { orderService } from '../../services/order';

interface ProfileProps {
  onNavigateTo: (page: 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'history' | 'profile' | 'tracking') => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigateTo }) => {
  const { isLoggedIn, user, updateUserGlobal } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      onNavigateTo('login');
      return;
    }
    setName(user.name);
    setPhone(user.phone || '');
    setAddress(user.address || '');
    setAvatar(user.avatar || '');

    const loadStats = async () => {
      try {
        const userOrders = await orderService.getOrders();
        setOrderCount(userOrders.length);
        setTotalSpent(userOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0));
      } catch {
        setOrderCount(0);
        setTotalSpent(0);
      }
    };
    loadStats();
  }, [isLoggedIn, user, onNavigateTo]);

  if (!user) return null;

  const handleAvatarUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berformat gambar (JPG, PNG, WebP, dll).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 300;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d')!;
        // Fill white background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, SIZE, SIZE);
        // Crop-fit center
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
        const dataUrl = canvas.toDataURL('image/webp', 0.75);
        setAvatar(dataUrl);
        toast.success('Foto profil siap disimpan!');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, name, phone, address, avatar || undefined);
      updateUserGlobal(updatedUser);
      setEditing(false);
      toast.success('Profil berhasil diperbarui! ✅', { duration: 3000 });
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user.id.startsWith('usr-google') ? 'Google Account' : 'Member Katsumboo';
  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-neutral-900 pb-24 md:pb-0 font-sans flex flex-col">
      <Navbar 
        onOpenCartModal={() => onNavigateTo('cart')}
        onNavigateTo={onNavigateTo as any}
      />

      <div className="flex-1">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-neutral-900 via-blue-950 to-neutral-900 h-48 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 50%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F6F4F0] to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 pb-16">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{initials}</span>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition cursor-pointer border-2 border-white"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]); }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-neutral-900">{user.name}</h2>
                <p className="text-sm text-neutral-500 mt-0.5">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    <Shield className="w-3 h-3" /> {user.role === 'admin' ? 'Admin' : 'Pelanggan'}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    <Star className="w-3 h-3" /> {memberSince}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="absolute top-0 right-0 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition cursor-pointer border border-blue-100"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profil
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-neutral-100">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <span className="block text-xl font-black text-neutral-900">{orderCount}</span>
                <span className="text-[9px] uppercase font-bold text-neutral-400">Total Order</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <span className="block text-xl font-black text-neutral-900">Aktif</span>
                <span className="text-[9px] uppercase font-bold text-neutral-400">Status Akun</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <span className="block text-[13px] font-black text-neutral-900 leading-tight">
                  Rp {(totalSpent / 1000).toFixed(0)}K
                </span>
                <span className="text-[9px] uppercase font-bold text-neutral-400">Total Belanja</span>
              </div>
            </div>
          </div>

          {/* Profile Form / Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-neutral-900">Informasi Akun</h3>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                    setPhone(user.phone || '');
                    setAddress(user.address || '');
                    setAvatar(user.avatar || '');
                  }}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-500 font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-5">
                {/* Avatar preview in form */}
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 border-2 border-white shadow">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black text-white">{initials}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-700">Foto Profil</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 mb-2">Klik kamera di avatar atau tombol di bawah ini</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-700 transition uppercase tracking-wide"
                    >
                      <Camera className="w-3 h-3" /> Upload Foto
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="ml-2 text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                <Input
                  label="Nama Lengkap"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <Input
                  label="Nomor WhatsApp / Telepon"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Alamat Pengiriman Utama
                  </label>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full p-3 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors h-24 resize-none bg-neutral-50/50"
                    placeholder="Jl. Contoh No. 123, Kel. Sukasari, Kec. Coblong, Kota Bandung"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={saving}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {[
                  { icon: <User className="w-4 h-4" />, label: 'Nama Lengkap', value: user.name },
                  { icon: <Mail className="w-4 h-4" />, label: 'Alamat Email', value: user.email },
                  { icon: <Phone className="w-4 h-4" />, label: 'Nomor WhatsApp', value: user.phone || 'Belum diisi' },
                  { icon: <MapPin className="w-4 h-4" />, label: 'Alamat Pengiriman', value: user.address || 'Belum diisi' },
                ].map((field, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-neutral-50 last:border-0">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 shrink-0 mt-0.5">
                      {field.icon}
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
                        {field.label}
                      </span>
                      <span className="text-sm font-semibold text-neutral-800 leading-relaxed block">
                        {field.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <BottomNavigation
        onOpenCartModal={() => onNavigateTo('cart')}
        onNavigateTo={onNavigateTo as any}
        activePage="profile"
      />
    </div>
  );
};

export default Profile;