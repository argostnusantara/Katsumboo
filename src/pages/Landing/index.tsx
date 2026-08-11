// src/pages/Landing/index.tsx
import React, { useRef, Suspense, Component } from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, useTexture } from "@react-three/drei";
import { motion } from "framer-motion";
import { Utensils, ChevronRight, Check, Loader2 } from "lucide-react";
import * as THREE from "three";

interface LandingPageProps {
  onNavigateTo: (page: 'home' | 'login' | 'register' | 'admin') => void;
}

// Error Boundary for WebGL/Canvas issues to prevent crash on non-supported browsers
class CanvasErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("3D Canvas rendering failed:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1D1D1B]">
          <div className="text-center p-4">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border border-neutral-700 mb-4 animate-pulse">
              <img src="/logokatsu.jpg" alt="Logo Katsumboo Fallback" className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Katsumboo 3D Visualizer Off</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Preload logo texture to avoid blank screen delay
useTexture.preload("/logokatsu.jpg");

// Sub-component for 3D logo mesh (hooks like useFrame must be run inside Canvas context)
function Katsu3DLogoMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture("/logokatsu.jpg");

  if (texture) {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
  }

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = 0.3; 
      meshRef.current.rotation.z = 0.2; 
      meshRef.current.rotation.y += 0.008;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef} castShadow receiveShadow scale={1.4}>
        <cylinderGeometry args={[1.2, 1.2, 0.2, 64]} />
        <meshStandardMaterial attach="material-0" color="#1151ff" roughness={0.1} metalness={0.8} />
        <meshStandardMaterial attach="material-1" map={texture} roughness={0.3} metalness={0.1} />
        <meshStandardMaterial attach="material-2" map={texture} roughness={0.3} metalness={0.1} />
      </mesh>
    </Float>
  );
}

// Aesthetic Canvas Loader Fallback
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Loading 3D Engine...</span>
      </div>
    </div>
  );
}

const products = [
  { 
    name: "Nasi Goreng Katsumboo", 
    desc: "Nasi goreng khas Indonesia dipadukan dengan chicken katsu crispy dan saus premium Katsumboo yang gurih dan lezat.",
    image: "/nasigoreng.png"
  },
  { 
    name: "Spaghetti Katsumboo", 
    desc: "Spaghetti premium dengan chicken katsu crispy dan saus khas Katsumboo yang gurih dan lezat.",
    image: "/spageti.png"
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateTo }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans selection:bg-blue-600 selection:text-white text-left flex flex-col">
      {/* Header / Navigation - Fixed and high z-index */}
      <nav className="fixed w-full bg-[#1A1A1A]/85 backdrop-blur-md z-50 px-6 py-4 flex justify-between items-center text-white border-b border-neutral-800/30">
        <div className="flex items-center gap-3 cursor-pointer pointer-events-auto" onClick={() => onNavigateTo('home')}>
          <img src="/logokatsu.jpg" alt="Logo Katsumboo" className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
          <span className="text-xl font-black tracking-tighter uppercase text-white">KATSUMBOO</span>
        </div>
        
        {/* Navigation links with click availability */}
        <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-neutral-300 font-bold pointer-events-auto">
          <a href="#about" className="hover:text-blue-500 transition-colors py-1">About</a>
          <a href="#menu" className="hover:text-blue-500 transition-colors py-1">Menu</a>
          <button 
            onClick={() => onNavigateTo('login')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Body */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center bg-[#1A1A1A] overflow-hidden">
          {/* 3D Canvas Box - Optimized Container & Mobile Friendly Settings */}
          <div className="absolute inset-0 w-full h-full opacity-65 md:opacity-85 z-0">
            <CanvasErrorBoundary>
              <Suspense fallback={<CanvasLoader />}>
                <div className="relative w-full h-full">
                  <Canvas 
                    shadows 
                    className="w-full h-full"
                    resize={{ scroll: true }} 
                    dpr={[1, 2]}
                  >
                    <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={50} />
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[5, 5, 5]} intensity={1.6} castShadow />
                    <pointLight position={[-5, -5, -3]} intensity={0.6} color="#1151ff" />
                    <spotLight position={[0, 5, 0]} intensity={1.2} angle={0.3} penumbra={1} />
                    <Katsu3DLogoMesh />
                  </Canvas>
                </div>
              </Suspense>
            </CanvasErrorBoundary>
          </div>

          {/* Hero text overlay */}
          <div className="relative z-10 text-center px-6 max-w-4xl text-white pointer-events-none select-none">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }} 
              className="text-4xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
            >
              Katsumboo Pelopor <span className="text-blue-500 block md:inline">Chicken Katsu Premium</span> yang Autentik & Tebal.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3, duration: 0.8 }} 
              className="text-sm md:text-xl text-neutral-300 mb-10 leading-relaxed max-w-2xl mx-auto font-light"
            >
              Menghadirkan kelezatan daging filet ayam segar berkualitas tinggi dengan cita rasa khas Jepang yang ramah di kantong generasi muda Bandung.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6, duration: 0.8 }} 
              className="pointer-events-auto"
            >
              <button 
                onClick={() => onNavigateTo('home')}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-900/40 cursor-pointer active:scale-95 z-10"
              >
                Lihat Menu Kami <ChevronRight size={20} className="ml-2" />
              </button>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 px-6 max-w-5xl mx-auto">
          <h3 className="text-4xl font-extrabold mb-12 text-center text-[#1A1A1A] tracking-tight">About Katsumboo</h3>
          <p className="text-lg md:text-xl text-neutral-600 text-center leading-relaxed mb-16 font-light">
            Katsumboo adalah usaha kuliner modern bidang Food & Beverages (F&B) yang mendedikasikan diri untuk meruntuhkan stigma bahwa makanan Jepang berkualitas selalu mahal. Nama &quot;Katsumboo&quot; memadukan &quot;Katsu&quot; dan &quot;Boo&quot; atau &quot;Boom&quot; yang melambangkan ledakan rasa yang luar biasa di lidah serta perkembangan bisnis yang pesat.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-neutral-700">
            <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm transition-all hover:shadow-md">
              <h4 className="font-bold text-lg mb-4 text-[#1A1A1A] uppercase tracking-wider">Our Core Values</h4>
              <ul className="space-y-4">
                {["100% daging ayam filet segar premium", "Higienis & profesional", "Teknik goreng khusus (krispi tahan lama)", "Variasi saus modern & lokal"].map((val, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <Check size={18} className="text-blue-600 shrink-0" /> {val}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1A1A1A] p-8 rounded-2xl text-white flex flex-col justify-center text-left">
              <h4 className="font-bold text-lg mb-4 text-blue-500 uppercase tracking-wider">Why We Exist</h4>
              <p className="text-neutral-300 leading-relaxed font-light">
                Kami lahir dari keinginan untuk menyajikan cita rasa premium yang dapat diakses oleh semua kalangan. Katsumboo bukan sekadar menu, melainkan sebuah gerakan kuliner untuk Bandung.
              </p>
            </div>
          </div>
        </section>

        {/* Menu Section - Mobile First Layout: 1 column mobile, 2 columns desktop */}
        <section id="menu" className="py-24 px-6 bg-white border-t border-neutral-100">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-extrabold mb-16 text-center text-[#1A1A1A] flex items-center justify-center gap-3 tracking-tight">
              <Utensils className="text-blue-600" /> Our Signature Menus
            </h3>
            
            {/* Responsiveness: 1 column full width on mobile, 2 columns on md/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center max-w-4xl mx-auto">
              {products.map((item, idx) => (
                <div key={idx} className="bg-[#FDFBF7] rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                  {/* Image container with strict fit controls to avoid squashing on mobile */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-neutral-100 w-full">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Premium
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {item.name}
                      </h4>
                      <p className="text-neutral-500 text-sm font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-neutral-200/60 text-xs font-bold uppercase tracking-widest text-blue-600">
                      Crispy & Juicy Chicken
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="py-24 px-6 bg-[#FDFBF7] border-t border-neutral-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-extrabold mb-16 text-center text-[#1A1A1A] tracking-tight">Solusi Yang Kami Hadirkan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { p: "Terbatasnya pilihan kuliner Jepang berkualitas tinggi yang ramah di kantong mahasiswa serta pelajar di kawasan Bandung.", s: "Menyajikan chicken katsu filet yang tebal dan juicy dengan kemasan yang minimalis serta higienis dengan harga yang sangat kompetitif." },
                { p: "Produk katsu komersial di pasaran didominasi oleh lapisan tepung yang tebal dengan potongan daging olahan yang tipis.", s: "Memberikan jaminan kerenyahan katsu asli yang berfokus pada ketebalan daging ayam segar menggunakan tepung panko khas Jepang." }
              ].map((item, i) => (
                <div key={i} className="space-y-4 bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm">
                  <div className="text-red-500 font-bold uppercase text-xs tracking-widest italic">Masalah</div>
                  <p className="text-md font-bold text-neutral-800 leading-snug">{item.p}</p>
                  <div className="text-blue-600 font-bold uppercase text-xs tracking-widest italic pt-4">Solusi Kami</div>
                  <p className="text-neutral-600 font-light text-sm leading-relaxed">{item.s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer & Order Channels - Ensured z-index & Clickability */}
      <footer id="contact" className="bg-[#1A1A1A] text-neutral-400 py-20 px-6 border-t border-neutral-800/40 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h4 className="text-white text-2xl font-bold mb-4 tracking-tight">Nikmati Kelezatan Katsumboo Sekarang.</h4>
          <p className="mb-12 font-light text-neutral-400 text-sm max-w-xl mx-auto">
            Kini hidangan chicken katsu premium favoritmu tersedia langsung di aplikasi pesan-antar online dan intip promo terbaru kami di media sosial.
          </p>
          
          {/* Order channels links wrapper with pointer-events-auto */}
          <div className="flex flex-col items-center gap-4 mb-16 w-full max-w-sm mx-auto px-4 pointer-events-auto">
            
            {/* Top row: Instagram */}
            <a 
              href="https://www.instagram.com/katsumboo?igsh=NTRlNWh6cTV1ZXh3" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between bg-white hover:bg-neutral-100 transition-all font-semibold px-5 py-3 rounded-2xl shadow-lg border border-neutral-200 group text-neutral-900 text-sm tracking-tight w-full overflow-hidden z-20"
            >
              <div className="flex items-center gap-3">
                <img src="/instagram.jpeg" alt="Logo Instagram" className="w-6 h-6 object-contain rounded-full border border-neutral-100" />
                <span>@katsumboo</span>
              </div>
              <ChevronRight size={16} className="text-neutral-400 group-hover:text-neutral-900 transition-colors" />
            </a>

            {/* Bottom row: Food aggregators */}
            <div className="grid grid-cols-2 gap-4 w-full z-20">
              {/* GoFood */}
              <a 
                href="https://gofood.link/a/S8HTyvJ" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between bg-white hover:bg-neutral-100 transition-all px-4 py-3 rounded-2xl shadow-lg border border-neutral-200 group h-14 w-full overflow-hidden"
              >
                <div className="flex items-center justify-center h-full flex-1 pt-1">
                  <img src="/gofood.png" alt="Logo GoFood" className="w-[85px] h-auto object-contain" />
                </div>
                <ChevronRight size={16} className="text-neutral-400 group-hover:text-neutral-900 transition-colors shrink-0" />
              </a>
              
              {/* ShopeeFood */}
              <a 
                href="https://shopee.co.id/universal-link/now-food/shop/21088372?deep_and_deferred=1&shareChannel=copy_link" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between bg-white hover:bg-neutral-100 transition-all px-4 py-3 rounded-2xl shadow-lg border border-neutral-200 group h-14 w-full overflow-hidden"
              >
                <div className="flex items-center justify-center h-full flex-1">
                  <img src="/shopeefood.jpeg" alt="Logo ShopeeFood" className="max-h-7 w-auto object-contain" />
                </div>
                <ChevronRight size={16} className="text-neutral-400 group-hover:text-neutral-900 transition-colors shrink-0" />
              </a>
            </div>
          </div>
          
          <div className="text-xs uppercase tracking-widest pt-8 border-t border-neutral-800/80 font-mono text-neutral-600">
            &copy; 2026 Katsumboo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};