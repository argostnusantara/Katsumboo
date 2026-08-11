// src/pages/Register/index.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface RegisterProps {
  onNavigateTo: (page: 'home' | 'login' | 'landing') => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateTo }) => {
  const { loginGlobal } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !address) {
      setError('Semua kolom wajib diisi!');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await authService.register(name, email, phone, address, password);
      loginGlobal(session);
      toast.success('Pendaftaran berhasil! Selamat datang di Katsumboo 👋', { duration: 3000 });
      onNavigateTo('home');
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-left font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100 relative">
        <button 
          onClick={() => onNavigateTo('landing')} 
          className="absolute top-6 left-6 text-xs text-neutral-400 hover:text-blue-600 font-bold transition-colors cursor-pointer"
        >
          ← Kembali
        </button>
        
        <div className="text-center mt-6 mb-8">
          <h3 className="text-2xl font-black text-neutral-900">Daftar Akun Baru</h3>
          <p className="text-xs text-neutral-400 mt-1">Gabung bersama Katsumboo untuk menikmati chicken katsu lezat.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nama Lengkap" 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Budi Santoso" 
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com" 
            required 
          />
          <Input 
            label="Nomor WhatsApp/Phone" 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx" 
            required 
          />
          <div className="space-y-1 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Alamat Pengiriman Utama
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Kost, Jalan, RT/RW, Kecamatan, Bandung..."
              className="w-full p-3 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors h-16 resize-none"
              required
            />
          </div>
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter" 
            required 
          />

          <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
            Buat Akun Baru
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Sudah punya akun?{' '}
          <button onClick={() => onNavigateTo('login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;