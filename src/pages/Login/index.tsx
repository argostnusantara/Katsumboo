// src/pages/Login/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

declare const google: any;

interface LoginProps {
  onNavigateTo: (page: 'home' | 'landing' | 'register' | 'admin') => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginGlobal } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasRealGoogle = clientId && clientId !== 'your-google-oauth-client-id.apps.googleusercontent.com';

  // Initialize real Google Sign-In SDK
  useEffect(() => {
    if (!hasRealGoogle || !googleBtnRef.current) return;

    const initGoogle = () => {
      if (typeof google === 'undefined') return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const toastId = toast.loading('Memproses masuk dengan Google...');
          try {
            const session = await authService.loginWithGoogleReal(response.credential);
            loginGlobal(session);
            toast.success(`Selamat datang, ${session.user.name}! 👋`, { id: toastId, duration: 3000 });
            onNavigateTo('home');
          } catch (err: any) {
            toast.error(err.message || 'Gagal masuk menggunakan Google.', { id: toastId });
          }
        }
      });
      google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current?.offsetWidth ?? 320,
        text: 'signin_with',
        locale: 'id'
      });
    };

    // Wait for SDK to load if not yet available
    if (typeof google !== 'undefined') {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (typeof google !== 'undefined') {
          initGoogle();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [hasRealGoogle, clientId, loginGlobal, onNavigateTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi!');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Memproses masuk...');

    try {
      const session = await authService.login(email, password);
      loginGlobal(session);
      toast.success(`Selamat datang, ${session.user.name}! 👋`, { id: toastId, duration: 3000 });
      if (session.user.role === 'admin') {
        onNavigateTo('admin');
      } else {
        onNavigateTo('home');
      }
    } catch (err: any) {
      toast.error(err.message || 'Email atau password salah!', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 text-left font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100 relative">
        {/* Back button */}
        <button 
          onClick={() => onNavigateTo('landing')} 
          className="absolute top-6 left-6 text-xs text-neutral-400 hover:text-blue-600 font-bold transition-colors cursor-pointer"
        >
          ← Kembali
        </button>

        <div className="text-center mt-6 mb-8 text-neutral-900">
          <h3 className="text-2xl font-black">Masuk Akun</h3>
          <p className="text-xs text-neutral-400 mt-1">Silakan masuk menggunakan akun Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Alamat Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com" 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            required 
          />

          <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
            Masuk Sekarang
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-neutral-100 w-full absolute"></div>
          <span className="bg-white px-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider relative z-10">atau masuk dengan</span>
        </div>

        {/* Real Google Sign-In button (shown only when Client ID is configured) */}
        {hasRealGoogle ? (
          <div ref={googleBtnRef} className="w-full flex justify-center" />
        ) : (
          <button
            type="button"
            onClick={() => toast.error('Google Sign-In belum dikonfigurasi. Tambahkan VITE_GOOGLE_CLIENT_ID di file .env untuk mengaktifkan fitur ini.', { duration: 5000 })}
            className="w-full flex items-center justify-center gap-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 bg-white py-3 rounded-xl font-bold text-xs transition-all"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.89 3.02C6.22 7.74 8.87 5.04 12 5.04z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2 3.7-4.97 3.7-8.62z"/>
              <path fill="#FBBC05" d="M5.28 14.78c-.26-.77-.4-1.6-.4-2.46s.15-1.69.4-2.46L1.39 6.84C.5 8.62 0 10.6 0 12.69s.5 4.07 1.39 5.85l3.89-3.76z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.04.7-2.37 1.11-4.23 1.11-3.13 0-5.78-2.7-6.72-5.54l-3.89 3.02C3.37 20.33 7.35 23 12 23z"/>
            </svg>
            Masuk dengan Google
          </button>
        )}


        <div className="mt-6 text-center text-xs text-neutral-500">
          Belum punya akun?{' '}
          <button onClick={() => onNavigateTo('register')} className="text-blue-600 font-bold hover:underline cursor-pointer">
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;