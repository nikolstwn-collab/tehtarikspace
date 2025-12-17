// app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Coffee, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Package, 
  FileText,
  ShoppingCart,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Transaksi Cepat",
      description: "Proses transaksi penjualan dengan cepat dan akurat. Interface yang mudah digunakan untuk kasir."
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Kelola Stok",
      description: "Monitor stok produk dan bahan baku secara real-time. Notifikasi otomatis saat stok menipis."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Manajemen Pegawai",
      description: "Kelola data pegawai, absensi, dan shift kerja dengan sistem yang terintegrasi."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Laporan Lengkap",
      description: "Dashboard analitik dengan laporan penjualan, pembelian, dan performa bisnis yang detail."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analisis Bisnis",
      description: "Insight mendalam tentang produk terlaris, trend penjualan, dan proyeksi pendapatan."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Keamanan Data",
      description: "Sistem autentikasi dan role-based access untuk melindungi data bisnis Anda."
    }
  ];

  const benefits = [
    "Interface yang mudah digunakan",
    "Laporan real-time & akurat",
    "Multi-role access (Owner & Karyawan)",
    "Kelola produk & bahan baku",
    "Tracking transaksi lengkap",
    "Dashboard analytics"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tea rounded-lg flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-tea-dark">Teh Tarik Space</h1>
                <p className="text-xs text-gray-500">POS System</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-700 hover:text-tea transition">Fitur</a>
              <a href="#benefits" className="text-gray-700 hover:text-tea transition">Keunggulan</a>
              <a href="#demo" className="text-gray-700 hover:text-tea transition">Demo</a>
              <Link 
                href="/auth"
                className="px-6 py-2 bg-tea text-white rounded-lg hover:bg-tea-dark transition font-medium"
              >
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <a href="#features" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Fitur</a>
                <a href="#benefits" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Keunggulan</a>
                <a href="#demo" className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">Demo</a>
                <Link 
                  href="/auth"
                  className="mx-4 px-6 py-2 bg-tea text-white rounded-lg hover:bg-tea-dark transition font-medium text-center"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cream via-white to-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-tea/10 rounded-full mb-6">
                <Zap className="w-4 h-4 text-tea" />
                <span className="text-sm font-medium text-tea">Sistem POS Modern</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Kelola Bisnis Teh Tarik Anda dengan
                <span className="text-tea"> Lebih Mudah</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sistem Point of Sale yang dirancang khusus untuk bisnis minuman dan makanan. 
                Kelola transaksi, stok, pegawai, dan laporan dalam satu platform terintegrasi.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth"
                  className="px-8 py-4 bg-tea text-white rounded-xl hover:bg-tea-dark transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="/auth"
                  className="px-8 py-4 bg-white border-2 border-tea text-tea rounded-xl hover:bg-cream transition font-semibold flex items-center justify-center gap-2"
                >
                  <Coffee className="w-5 h-5" />
                  Lihat Demo
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-tea">100%</p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-tea">Real-time</p>
                  <p className="text-sm text-gray-600">Reporting</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-tea">24/7</p>
                  <p className="text-sm text-gray-600">Access</p>
                </div>
              </div>
            </div>

            {/* Right Image/Preview */}
            <div className="relative">
              <div className="bg-gradient-to-br from-tea-dark to-tea rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition duration-300">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-tea rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Dashboard</p>
                      <p className="text-xs text-gray-500">Overview Bisnis</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-tea" />
                        <span className="text-sm font-medium">Penjualan Hari Ini</span>
                      </div>
                      <span className="font-bold text-tea">Rp 2.5jt</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-tea" />
                        <span className="text-sm font-medium">Produk Terjual</span>
                      </div>
                      <span className="font-bold text-tea">156</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-cream rounded-xl">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-tea" />
                        <span className="text-sm font-medium">Trend</span>
                      </div>
                      <span className="font-bold text-green-600">+23%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-tea/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cream rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Bisnis Anda
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola bisnis teh tarik dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white border-2 border-gray-100 rounded-2xl hover:border-tea hover:shadow-xl transition duration-300"
              >
                <div className="w-16 h-16 bg-tea/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-tea group-hover:text-white text-tea transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cream to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mengapa Memilih Teh Tarik Space?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Dirancang khusus untuk kemudahan pengelolaan bisnis F&B Anda
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="w-6 h-6 bg-tea rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tea rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Hemat Waktu</p>
                      <p className="text-sm text-gray-600">Proses transaksi 3x lebih cepat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tea rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Tingkatkan Profit</p>
                      <p className="text-sm text-gray-600">Kontrol stok & minimalisir waste</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tea rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Data Aman</p>
                      <p className="text-sm text-gray-600">Enkripsi & backup otomatis</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-tea-dark to-tea">
        <div className="max-w-4xl mx-auto text-center">
          <Coffee className="w-16 h-16 text-cream mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Mencoba?
          </h2>
          <p className="text-xl text-cream mb-8">
            Login dengan kredensial demo dan rasakan kemudahan sistem kami
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-cream-dark text-sm mb-3">Demo Owner</p>
              <p className="text-white font-bold text-lg mb-1">admin</p>
              <p className="text-cream">1234</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-cream-dark text-sm mb-3">Demo Karyawan</p>
              <p className="text-white font-bold text-lg mb-1">staff</p>
              <p className="text-cream">12345</p>
            </div>
          </div>

          <Link 
            href="/auth"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-tea rounded-xl hover:bg-cream transition font-semibold shadow-2xl hover:shadow-xl"
          >
            Login & Coba Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-tea rounded-lg flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Teh Tarik Space</h3>
                  <p className="text-sm text-gray-400">POS System</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Solusi sistem Point of Sale terbaik untuk bisnis minuman dan makanan Anda.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Fitur</a></li>
                <li><a href="#benefits" className="text-gray-400 hover:text-white transition">Keunggulan</a></li>
                <li><a href="#demo" className="text-gray-400 hover:text-white transition">Demo</a></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@tehtarik.space</li>
                <li>Phone: +62 812 3456 7890</li>
                <li>Yogyakarta, Indonesia</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2025 Teh Tarik Space. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}