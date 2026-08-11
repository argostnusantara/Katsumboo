// src/pages/Cart/index.tsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/Footer';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { orderService } from '../../services/order';
import type { Voucher } from '../../types/order';
import { MapPin, Tag, ShoppingBag, Trash, Loader2, CreditCard, Minus, Plus, ExternalLink, Smartphone, Banknote, QrCode } from 'lucide-react';

interface CartProps {
  onNavigateTo: (page: 'landing' | 'home' | 'login' | 'register' | 'admin' | 'cart' | 'history' | 'profile' | 'tracking') => void;
}

export const CartPage: React.FC<CartProps> = ({ onNavigateTo }) => {
  const { cartItems, totalPrice, removeFromCart, clearCart, addToCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  
  const [alamat, setAlamat] = useState('');
  const [phone, setPhone] = useState('');
  type MainPayment = 'QRIS' | 'GoPay' | 'ShopeePay' | 'Bank Transfer';
  const [paymentMethod, setPaymentMethod] = useState<MainPayment>('QRIS');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'SeaBank' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Map & Shipping States
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Voucher States
  const [voucherCode, setVoucherCode] = useState('');
  const [activeVouchers, setActiveVouchers] = useState<Voucher[]>([]);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  useEffect(() => {
    if (isLoggedIn && user) {
      setAlamat(user.address || '');
      setPhone(user.phone || '');
    }
  }, [isLoggedIn, user]);

  // Auto-calculate distance & pin from address text (no manual click needed)
  useEffect(() => {
    if (alamat.trim().length > 5) {
      let hash = 0;
      for (let i = 0; i < alamat.length; i++) {
        hash = alamat.charCodeAt(i) + ((hash << 5) - hash);
        hash |= 0;
      }
      const x = 25 + Math.abs(hash % 50); // 25–75% range
      const y = 25 + Math.abs((hash >> 3) % 50);
      setPin({ x, y });
      const dx = x - 50;
      const dy = y - 50;
      const dist = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) * 0.28));
      setDistanceKm(dist);
      setShippingFee(Math.min(30000, Math.max(6000, dist * 3000)));
    } else {
      setPin(null);
      setDistanceKm(0);
      setShippingFee(0);
    }
  }, [alamat]);

  const handleIncrease = (item: any, idx: number) => {
    removeFromCart(idx);
    addToCart({
      ...item,
      quantity: item.quantity + 1
    });
  };

  const handleDecrease = (item: any, idx: number) => {
    removeFromCart(idx);
    if (item.quantity > 1) {
      addToCart({
        ...item,
        quantity: item.quantity - 1
      });
    }
  };

  // Map click handler (Bandung Coordinate Mock Map)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPin({ x, y });

    const dx = x - 50;
    const dy = y - 50;
    const dist = Math.max(1, Math.round(Math.sqrt(dx*dx + dy*dy) * 0.25));
    setDistanceKm(dist);

    const fee = Math.min(30000, Math.max(6000, dist * 3000));
    setShippingFee(fee);

    // Filter free shipping vouchers if min purchase conditions aren't met
    setActiveVouchers(prev =>
      prev.filter(v => {
        if (v.type === 'free_shipping' && totalPrice < v.minPurchase) {
          toast.error(`Voucher ${v.code} dilepas karena belanja di bawah Rp ${v.minPurchase.toLocaleString('id-ID')}`);
          return false;
        }
        return true;
      })
    );
  };

  const applyVoucher = async () => {
    setVoucherError('');
    setVoucherSuccess('');
    const code = voucherCode.trim().toUpperCase();

    if (!code) return;

    if (activeVouchers.some(v => v.code === code)) {
      setVoucherError('Voucher ini sudah Anda gunakan di keranjang!');
      return;
    }

    if (activeVouchers.length >= 2) {
      setVoucherError('Maksimal hanya 2 voucher yang dapat dimasukkan!');
      return;
    }

    try {
      const res = await orderService.validateVoucher(code, totalPrice);
      if (res.valid) {
        const found: Voucher = {
          id: res.coupon.id,
          code: res.coupon.code,
          type: res.coupon.type as any,
          value: res.coupon.value,
          minPurchase: res.coupon.minPurchase,
          description: res.coupon.description,
          maxUses: res.coupon.maxUses,
          usedByUserIds: res.coupon.usedByUserIds || [],
          sentToUserIds: res.coupon.sentToUserIds || [],
          createdAt: res.coupon.createdAt
        };
        setActiveVouchers([...activeVouchers, found]);
        setVoucherCode('');
        setVoucherSuccess(`Voucher ${found.code} berhasil dimasukkan!`);
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Gagal memvalidasi voucher.');
    }
  };

  const removeVoucher = (idx: number) => {
    setActiveVouchers(activeVouchers.filter((_, i) => i !== idx));
    setVoucherSuccess('');
    setVoucherError('');
  };

  // Calculate discounts
  let discountAmount = 0;
  let currentShippingFee = shippingFee;
  activeVouchers.forEach(v => {
    if (v.type === 'fixed') {
      discountAmount += v.value;
    } else if (v.type === 'percent') {
      discountAmount += Math.min(15000, (totalPrice * v.value) / 100);
    } else if (v.type === 'free_shipping') {
      const freeShippingDiscount = Math.min(currentShippingFee, v.value);
      discountAmount += freeShippingDiscount;
      currentShippingFee = Math.max(0, currentShippingFee - freeShippingDiscount);
    }
  });

  const grandTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Anda harus masuk/login terlebih dahulu untuk melakukan transaksi pemesanan!');
      onNavigateTo('login');
      return;
    }

    if (!alamat.trim()) {
      toast.error('Harap isi alamat pengiriman lengkap Anda!');
      return;
    }

    if (!phone.trim()) {
      toast.error('Harap isi nomor telepon/WhatsApp aktif Anda!');
      return;
    }

    if (!pin) {
      toast.error('Harap isi alamat pengiriman Anda terlebih dahulu!');
      return;
    }

    if (paymentMethod === 'Bank Transfer' && !selectedBank) {
      toast.error('Harap pilih bank tujuan transfer terlebih dahulu!');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    setShowPaymentModal(false);

    try {
      const orderData = {
        userId: user?.id || 'usr-guest',
        customerName: user?.name || 'Customer Guest',
        customerPhone: phone,
        address: alamat,
        items: cartItems,
        subtotal: totalPrice,
        discount: discountAmount,
        shippingFee: shippingFee,
        grandTotal: grandTotal,
        paymentMethod: (paymentMethod === 'Bank Transfer' ? `${selectedBank} Transfer` : paymentMethod) as any,
        paymentStatus: 'Paid' as const,
        status: 'Pending' as const,
        distanceKm: distanceKm,
        mapCoords: pin || { x: 50, y: 50 },
        platform: 'Katsumboo Direct' as const,
        voucherCodes: activeVouchers.map(v => v.code),
        statusTimestamps: {
          pending: new Date().toISOString()
        }
      };

      const createdOrder = await orderService.createOrder(orderData);
      
      // Vouchers are marked as used by backend upon order completion

      localStorage.setItem('katsumboo_active_order_id', createdOrder.id);
      
      const pushMsg = `🔔 Pesanan baru ${createdOrder.id} berhasil dibuat! Menunggu konfirmasi toko.`;
      localStorage.setItem('katsumboo_pending_push', pushMsg);
      
      clearCart();
      onNavigateTo('tracking');
    } catch (e) {
      toast.error('Gagal memproses transaksi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 pb-24 md:pb-0 font-sans flex flex-col justify-between">
      <div>
        <Navbar 
          onOpenCartModal={() => {}}
          onNavigateTo={onNavigateTo as any}
        />

        <div className="max-w-6xl mx-auto pt-28 px-6 pb-16">
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tight text-neutral-900 text-left flex items-center gap-2">
            🛒 Keranjang Belanja Anda
          </h2>

          {cartItems.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-neutral-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mx-auto text-neutral-400">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-lg font-black text-neutral-800">Keranjang Belanja Kosong</h3>
              <p className="text-xs text-neutral-450 max-w-sm mx-auto leading-relaxed">
                Anda belum memilih menu katsu lezat. Jelajahi menu kami dan masukkan ke dalam keranjang.
              </p>
              <button 
                onClick={() => onNavigateTo('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl uppercase tracking-wider transition-all cursor-pointer inline-block"
              >
                Kembali ke Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form & Maps */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Alamat & Peta */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-50 pb-3">
                    <MapPin className="w-4 h-4 text-blue-600" /> Informasi Pengiriman
                  </h3>
                  
                  {!isLoggedIn && (
                    <div className="p-3.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl text-xs font-medium leading-relaxed">
                      💡 Anda sedang memesan sebagai Guest. Silakan <button onClick={() => onNavigateTo('login')} className="font-bold underline text-blue-600">Login</button> atau <button onClick={() => onNavigateTo('register')} className="font-bold underline text-blue-600">Daftar</button> agar alamat tersimpan otomatis!
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Nomor Telepon/WhatsApp Aktif"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      required
                    />
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">Alamat Lengkap</label>
                      <textarea
                        value={alamat}
                        onChange={e => setAlamat(e.target.value)}
                        placeholder="Tulis alamat kost/rumah, nomor kamar, jalan, RT/RW..."
                        className="w-full p-3 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-blue-600 transition-colors h-10 min-h-[46px] resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Dynamic Map Component */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Pinpoint Peta Bandung (Menghitung Jarak Outlet) <span className="text-red-500">*</span>
                    </label>
                    <div 
                      onClick={handleMapClick}
                      className="relative w-full h-56 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden cursor-crosshair select-none"
                    >
                      {/* Styled Grid SVG Mock Map */}
                      <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <path d="M 0,112 L 400,112 M 180,0 L 180,300 M 0,30 L 400,200" stroke="#333" strokeWidth="3" fill="none" />
                        <circle cx="50%" cy="50%" r="30" fill="#1151ff" fillOpacity="0.05" />
                      </svg>

                      {/* Map Landmarks */}
                      <div className="absolute top-[20%] left-[25%] text-[9px] font-bold text-neutral-500 font-mono">Dago</div>
                      <div className="absolute top-[48%] left-[72%] text-[9px] font-bold text-neutral-500 font-mono">Antapani</div>
                      <div className="absolute top-[75%] left-[20%] text-[9px] font-bold text-neutral-500 font-mono">Buah Batu</div>
                      <div className="absolute top-[25%] left-[55%] text-[9px] font-bold text-neutral-500 font-mono">Gedung Sate</div>

                      {/* Katsumboo HQ (Center) */}
                      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white absolute animate-ping"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-600 border border-white z-10"></div>
                        <span className="text-[8px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded shadow mt-1 uppercase tracking-wider font-mono">Outlet Pusat</span>
                      </div>

                      {/* Placed User Pin */}
                      {pin && (
                        <div 
                          className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        >
                          <MapPin className="w-6 h-6 text-red-500 fill-red-500 animate-bounce" />
                          <span className="text-[7px] bg-red-500 text-white font-extrabold px-1 rounded shadow -mt-1 whitespace-nowrap">LOKASI ANDA</span>
                        </div>
                      )}
                    </div>

                    {pin ? (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                          <span>Jarak dari outlet: <strong>{distanceKm} km</strong></span>
                          <span className="text-blue-600 font-bold">Ongkir dihitung otomatis ✓</span>
                        </div>
                        {alamat.trim() && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=-6.9175,107.6191&destination=${encodeURIComponent(alamat)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Lihat Rute di Google Maps
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-amber-600 font-semibold mt-2">
                        ⚠️ Isi alamat pengiriman di atas untuk menghitung jarak & ongkos kirim otomatis.
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Pilihan Pembayaran */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> Metode Pembayaran
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    {([
                      { id: 'QRIS' as const, label: '🔲 QRIS', icon: <QrCode className="w-4 h-4" /> },
                      { id: 'GoPay' as const, label: '🟢 GoPay', icon: <Smartphone className="w-4 h-4" /> },
                      { id: 'ShopeePay' as const, label: '🟠 ShopeePay', icon: <Smartphone className="w-4 h-4" /> },
                      { id: 'Bank Transfer' as const, label: '🏦 Transfer Bank', icon: <Banknote className="w-4 h-4" /> },
                    ] as { id: 'QRIS'|'GoPay'|'ShopeePay'|'Bank Transfer', label: string, icon: React.ReactNode }[]).map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => { setPaymentMethod(method.id); setSelectedBank(null); }}
                        className={`py-3 px-2 text-xs font-bold rounded-2xl border-2 transition-all text-center cursor-pointer flex flex-col items-center gap-1 ${
                          paymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-base">{method.label.split(' ')[0]}</span>
                        <span>{method.label.split(' ').slice(1).join(' ')}</span>
                      </button>
                    ))}
                  </div>

                  {/* Bank Transfer sub-selector */}
                  {paymentMethod === 'Bank Transfer' && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Pilih Bank Tujuan:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['BCA', 'SeaBank'] as const).map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`py-2.5 px-3 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                              selectedBank === bank
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                            }`}
                          >
                            🏦 {bank}
                          </button>
                        ))}
                      </div>
                      {selectedBank && (
                        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Nomor Rekening {selectedBank}</p>
                          <p className="font-mono text-sm font-black text-neutral-800 mt-0.5">
                            {selectedBank === 'BCA' ? '8921 0812 3456 7890' : '9018 7766 5544 3322'}
                          </p>
                          <p className="text-[9px] text-neutral-500 mt-0.5">a.n. Katsumboo Official</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Items list */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    🍱 Item Pesanan Anda
                  </h3>
                  
                  <div className="divide-y divide-neutral-100">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="py-4 flex justify-between items-center gap-4 text-xs">
                        <div className="flex gap-3">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-100 shrink-0" 
                          />
                          <div className="text-left space-y-0.5">
                            <h4 className="font-extrabold text-neutral-800">{item.name}</h4>
                            <p className="text-[10px] text-neutral-450 font-medium">
                              {[
                                item.selectedSauce && item.selectedSauce !== 'None' && item.selectedSauce !== '' ? `Saus: ${item.selectedSauce}` : null,
                                item.levelPedas !== undefined && item.levelPedas > 0 ? `Lvl Pedas: ${item.levelPedas}` : null,
                                ...(item.selectedCustomizations 
                                  ? Object.entries(item.selectedCustomizations).map(([k, v]) => `${k}: ${v}`)
                                  : [])
                              ].filter(Boolean).join(' • ')}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] italic text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded w-fit">
                                &quot;{item.notes}&quot;
                              </p>
                            )}
                            <span className="block text-[11px] font-bold text-blue-600 mt-1">
                              Rp {item.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Adjust quantities */}
                        <div className="flex items-center gap-3.5 bg-neutral-50 rounded-2xl px-2 py-1 border border-neutral-100">
                          <button 
                            type="button" 
                            onClick={() => handleDecrease(item, idx)} 
                            className="p-1 text-neutral-500 hover:text-red-500 cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-extrabold text-neutral-800 w-4 text-center">{item.quantity}</span>
                          <button 
                            type="button" 
                            onClick={() => handleIncrease(item, idx)} 
                            className="p-1 text-neutral-500 hover:text-blue-600 cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => removeFromCart(idx)} 
                            className="p-1 text-red-500 hover:text-red-700 shrink-0 cursor-pointer ml-1 border-l border-neutral-200 pl-2"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Checkout Summary & Voucher Apply */}
              <div className="space-y-6">
                
                {/* Voucher Apply Panel */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-600" /> Voucher Promo Katsumboo (Maks 2)
                  </h3>

                  {activeVouchers.length > 0 && (
                    <div className="space-y-2">
                      {activeVouchers.map((voucher, idx) => (
                        <div key={voucher.id} className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                          <div className="text-left">
                            <span className="font-black text-blue-600 block">{voucher.code}</span>
                            <p className="text-[10px] text-neutral-500 mt-0.5">{voucher.description}</p>
                          </div>
                          <button 
                            onClick={() => removeVoucher(idx)}
                            className="text-red-500 font-bold text-xs hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeVouchers.length < 2 && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={e => setVoucherCode(e.target.value)}
                        placeholder="Contoh: FREEONGKIR"
                        className="flex-1 p-3 border border-neutral-200 rounded-xl text-xs uppercase focus:outline-none focus:border-blue-600 focus:bg-white bg-neutral-50/50"
                      />
                      <button 
                        type="button"
                        onClick={applyVoucher}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 rounded-xl transition-all cursor-pointer"
                      >
                        Pakai
                      </button>
                    </div>
                  )}

                  {voucherError && (
                    <p className="text-[10px] text-red-500 font-bold text-left">{voucherError}</p>
                  )}
                  {voucherSuccess && (
                    <p className="text-[10px] text-green-600 font-bold text-left">{voucherSuccess}</p>
                  )}
                </div>

                {/* Ringkasan Biaya */}
                <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm text-xs space-y-4">
                  <h3 className="font-extrabold text-neutral-900 text-sm text-left">Ringkasan Pembayaran</h3>
                  
                  <div className="space-y-2 border-b border-neutral-50 pb-3 text-neutral-500 text-left">
                    <div className="flex justify-between">
                      <span>Total Makanan ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} Porsi):</span>
                      <span className="font-bold text-neutral-800">Rp {totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Pengiriman:</span>
                      <span className="font-bold text-neutral-800">Rp {shippingFee.toLocaleString('id-ID')}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Potongan Voucher:</span>
                        <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="border-t border-neutral-100 pt-3 flex justify-between font-black text-blue-600 text-base">
                      <span>Total Bayar:</span>
                      <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="pt-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-full uppercase tracking-wider font-bold py-3.5 rounded-2xl"
                    >
                      Bayar Sekarang • Rp {grandTotal.toLocaleString('id-ID')}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <BottomNavigation 
        onOpenCartModal={() => {}} 
        onNavigateTo={onNavigateTo as any} 
        activePage="home"
      />

      {/* Gateway Sandbox Payments Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-left border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest shadow">
                Konfirmasi Pembayaran
              </span>
              <h3 className="text-lg font-black text-neutral-900 mt-3">Pembayaran Katsumboo</h3>
              <p className="text-xs text-neutral-400 mt-1">Metode: <strong className="text-neutral-700">{paymentMethod === 'Bank Transfer' ? `Transfer ${selectedBank}` : paymentMethod}</strong></p>
            </div>

            <div className="space-y-4 py-3">
              {/* QRIS */}
              {paymentMethod === 'QRIS' && (
                <div className="p-5 bg-neutral-50 border border-neutral-100 rounded-2xl flex flex-col items-center gap-3">
                  <div className="w-32 h-32 bg-white border-2 border-neutral-200 rounded-xl flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-neutral-700" />
                  </div>
                  <p className="text-[10px] text-neutral-500 text-center">Scan QR Code ini menggunakan aplikasi dompet digital atau mobile banking Anda.</p>
                </div>
              )}
              {/* GoPay */}
              {paymentMethod === 'GoPay' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center space-y-1">
                  <p className="text-sm font-black text-green-700">🟢 GoPay</p>
                  <p className="font-mono text-base font-black text-neutral-800">0812-3456-7890</p>
                  <p className="text-[9px] text-neutral-500">Transfer GoPay ke nomor di atas a.n. Katsumboo Official</p>
                </div>
              )}
              {/* ShopeePay */}
              {paymentMethod === 'ShopeePay' && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center space-y-1">
                  <p className="text-sm font-black text-orange-700">🟠 ShopeePay</p>
                  <p className="font-mono text-base font-black text-neutral-800">0856-7788-9900</p>
                  <p className="text-[9px] text-neutral-500">Transfer ShopeePay ke nomor di atas a.n. Katsumboo Official</p>
                </div>
              )}
              {/* Bank Transfer */}
              {paymentMethod === 'Bank Transfer' && selectedBank && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wider">
                    Nomor Rekening {selectedBank}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-base font-black text-neutral-800">
                      {selectedBank === 'BCA' ? '8921 0812 3456 7890' : '9018 7766 5544 3322'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard?.writeText(selectedBank === 'BCA' ? '89210812345678990' : '90187766554433322'); toast.success('Nomor rekening disalin!'); }}
                      className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Salin
                    </button>
                  </div>
                  <p className="text-[9px] text-neutral-500">a.n. Katsumboo Official</p>
                </div>
              )}
              <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
                Total tagihan: <strong className="text-blue-600">Rp {grandTotal.toLocaleString('id-ID')}</strong>. Pesanan diproses setelah konfirmasi pembayaran diterima.
              </p>
            </div>

            {/* Total Details */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-between items-center text-xs">
              <span className="text-neutral-500">Total Tagihan:</span>
              <span className="text-base font-black text-blue-600">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>

            {/* Simulator Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handlePaymentSuccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : '✓ Simulasikan Bayar Sukses'}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 font-bold py-3 rounded-2xl text-xs transition-all uppercase tracking-wider text-center cursor-pointer"
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

export default CartPage;