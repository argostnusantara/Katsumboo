// src/App.tsx
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LandingPage } from './pages/Landing';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminIndex } from './pages/Admin';
import { CartPage } from './pages/Cart';
import { Tracking } from './pages/Tracking';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { InboxPage } from './pages/Inbox';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';

type PageType = 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'tracking' | 'history' | 'profile' | 'inbox';

function MainAppContent() {
  const [page, setPage] = useState<PageType>('landing');
  const [notification, setNotification] = useState<string | null>(null);

  // Monitor simulated push notifications via localStorage
  useEffect(() => {
    const checkNotification = () => {
      const pendingMsg = localStorage.getItem('katsumboo_pending_push');
      if (pendingMsg) {
        setNotification(pendingMsg);
        localStorage.removeItem('katsumboo_pending_push');

        // Automatically hide after 4 seconds
        setTimeout(() => {
          setNotification(null);
        }, 4000);
      }
    };

    checkNotification();
    window.addEventListener('storage', checkNotification);
    
    // Add custom polling in case it's on the same window thread
    const interval = setInterval(checkNotification, 2000);

    return () => {
      window.removeEventListener('storage', checkNotification);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Visual Router */}
      {page === 'landing' && <LandingPage onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'home' && <Home onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'login' && <Login onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'register' && <Register onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'admin' && <AdminIndex onNavigateTo={() => setPage('home')} />}
      {page === 'cart' && <CartPage onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'tracking' && <Tracking onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'history' && <History onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'profile' && <Profile onNavigateTo={(target: any) => setPage(target)} />}
      {page === 'inbox' && <InboxPage onNavigateTo={(target: any) => setPage(target)} />}

      {/* Global Simulated Push Notification Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-20 right-6 left-6 md:left-auto md:w-96 z-[999] bg-[#1A1A1A] text-white p-4 rounded-2xl border border-neutral-800 shadow-2xl flex items-start gap-3.5"
          >
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shrink-0 shadow-lg shadow-blue-500/20">
              <Bell className="w-5 h-5 animate-swing" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-500 block">Notifikasi Katsumboo</span>
              <p className="text-xs text-neutral-200 mt-1 leading-relaxed font-semibold">{notification}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-neutral-500 hover:text-white font-bold text-xs cursor-pointer px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#FDFBF7] text-neutral-950 font-sans antialiased">
          <ErrorBoundary>
            <MainAppContent />
          </ErrorBoundary>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={10}
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '14px',
                background: '#18181b',
                color: '#f4f4f5',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                padding: '14px 18px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                maxWidth: '380px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#18181b' },
                style: { borderLeft: '4px solid #22c55e' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#18181b' },
                style: { borderLeft: '4px solid #ef4444' },
              },
              loading: {
                iconTheme: { primary: '#3b82f6', secondary: '#18181b' },
                style: { borderLeft: '4px solid #3b82f6' },
              },
            }}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}