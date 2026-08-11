// src/pages/Home/index.tsx
import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/Footer';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { FloatingCart } from '../../components/cart/FloatingCart';
import { ModalCart } from '../../components/cart/ModalCart';
import { Banner } from '../../components/menu/Banner';
import { SearchBar } from '../../components/menu/SearchBar';
import { Category } from '../../components/menu/Category';
import { CardMenu } from '../../components/menu/Cardmenu';
import { useCart } from '../../contexts/CartContext';
import { menuService } from '../../services/menu';
import type { Product } from '../../types/menu';
import { NewUserVoucherPopup } from '../../components/common/NewUserVoucherPopup';
import { Loader2 } from 'lucide-react';

interface HomeProps {
  onNavigateTo: (page: 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'history' | 'profile' | 'tracking') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateTo }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeOpen, setStoreOpen] = useState(true);
  const [showCartModal, setShowCartModal] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  // Load products and store status on mount
  useEffect(() => {
    const fetchData = async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true);
        const dataProducts = await menuService.getProducts();
        const isOpen = await menuService.getStoreOpen();
        const cats = await menuService.getCategories();
        setProducts(dataProducts);
        setStoreOpen(isOpen);
        setCategories(cats);
      } catch (e) {
        console.error("Gagal memuat produk dan status toko", e);
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchData(true);

    // Auto-refresh setiap 30 detik agar perubahan ketersediaan dari Admin langsung terlihat
    const interval = setInterval(() => fetchData(false), 30000);

    // Refetch saat user kembali ke tab ini (misalnya dari tab admin)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Refetch segera jika admin mengubah ketersediaan menu di tab lain
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'katsumboo_menu_updated') {
        fetchData(false);
      }
    };
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Filter products based on search keyword and selected category
  const filteredProducts = products.filter(product => {
    const matchesKeyword = product.name.toLowerCase().includes(keyword.toLowerCase());
    const prodCat = typeof product.category === 'object' && product.category !== null ? (product.category as any).name : String(product.category || '');
    const matchesCategory = selectedCategory === 'Semua' || prodCat === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 pb-24 md:pb-0 font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenCartModal={() => setShowCartModal(true)}
          onNavigateTo={onNavigateTo as any}
        />

        <div className="max-w-6xl mx-auto pt-28 px-6 pb-16">
          {/* Banner Promo */}
          <Banner />
          
          {/* Warning Toko Tutup */}
          {!storeOpen && (
            <div className="mb-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse text-left">
              <div>
                <h4 className="font-extrabold text-red-800 text-lg">🏪 Toko Sedang Tutup Sementara</h4>
                <p className="text-xs text-red-600 font-medium mt-1">Kami sedang istirahat atau kehabisan stok bahan baku di dapur. Anda tetap bisa melihat-lihat menu.</p>
              </div>
              <span className="bg-red-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider h-fit w-fit">
                Offline
              </span>
            </div>
          )}

          {/* Search bar & Category Navigation */}
          <SearchBar keyword={keyword} onKeywordChange={setKeyword} />
          <Category 
            categories={Array.isArray(categories) ? categories : []}
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />

          <h3 className="text-xl font-black text-[#1A1A1A] mb-6 uppercase tracking-tight text-left">
            Menu Katsumboo Premium
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
            </div>
          ) : (filteredProducts || []).length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-neutral-400 font-medium">Menu tidak ditemukan. Coba ganti kata kunci atau kategori.</p>
            </div>
          ) : (
            /* Product grid - Responsive: 1 column on mobile, 2 columns on small tab, 3 columns on desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {(filteredProducts || []).map((product) => (
                <CardMenu 
                  key={product.id}
                  product={{
                    ...product,
                    // If store is closed, disable purchase option for all products
                    isAvailable: storeOpen ? product.isAvailable : false
                  }}
                  onAddToCart={(customData) => {
                    addToCart({
                      ...product,
                      quantity: 1,
                      notes: customData.notes,
                      selectedCustomizations: customData.customizations
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Navigasi Khusus Mobile Screen */}
      <FloatingCart onClick={() => setShowCartModal(true)} />
      <BottomNavigation 
        onOpenCartModal={() => setShowCartModal(true)} 
        onNavigateTo={onNavigateTo as any} 
        activePage="home"
      />

      {/* Modal Keranjang Samping */}
      <ModalCart 
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        onNavigateToCheckout={() => {
          setShowCartModal(false);
          onNavigateTo('cart');
        }}
      />

      {/* Pop-up Voucher Selamat Datang untuk Pelanggan Baru */}
      <NewUserVoucherPopup />
    </div>
  );
};

export default Home;