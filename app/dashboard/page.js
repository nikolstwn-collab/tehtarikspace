// app/(dashboard)/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ShoppingCart,
  Users,
  Package,
  FileText,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import TransactionForm from '@/components/TransactionForm';
import ProductGrid from '@/components/ProductGrid';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const isOwner = session?.user?.role === 'OWNER';

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProducts();
      fetchLowStockMaterials();
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      const sessionData = await getSession();

      const response = await fetch('/api/products', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData?.user?.name || ''}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Gagal memuat produk');
        setProducts([]);
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Gagal memuat produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW — ambil bahan baku stok menipis
  const fetchLowStockMaterials = async () => {
    try {
      const res = await fetch('/api/raw-materials');
      const data = await res.json();

      if (Array.isArray(data)) {
        const lowStock = data.filter(m => Number(m.stock) < 10);
        setLowStockMaterials(lowStock);
      }
    } catch (err) {
      console.error('Gagal cek stok bahan:', err);
    }
  };

  const handleProductSelect = (product) => {
    const existing = selectedProducts.find((p) => p.id === product.id);

    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }

    toast.success(`${product.name} ditambahkan`);
  };

  const handleTransactionComplete = () => {
    setSelectedProducts([]);
    fetchProducts();
    fetchLowStockMaterials(); // ✅ refresh warning after sales
  };

  const navigationCards = [
    {
      title: 'Transaksi Pembelian',
      description: 'Kelola pembelian bahan & stok',
      icon: ShoppingCart,
      href: '/dashboard/pembelian',
      color: 'from-blue-500 to-blue-600',
      roles: ['OWNER', 'KARYAWAN'],
    },
    {
      title: 'Kelola Pegawai',
      description: 'Manage pegawai & shift kerja',
      icon: Users,
      href: '/dashboard/pegawai',
      color: 'from-purple-500 to-purple-600',
      roles: ['OWNER', 'KARYAWAN'],
    },
    {
      title: 'Kelola Bahan Baku',
      description: 'Tracking stok bahan produksi',
      icon: Package,
      href: '/dashboard/bahan-baku',
      color: 'from-orange-500 to-orange-600',
      roles: ['OWNER'],
    },
    {
      title: 'Laporan Keuangan',
      description: 'Lihat laporan & statistik',
      icon: FileText,
      href: '/dashboard/laporan',
      color: 'from-green-500 to-green-600',
      roles: ['OWNER', 'KARYAWAN'],
    },
  ];

  const filteredNav = navigationCards.filter((card) =>
    card.roles.includes(session?.user?.role)
  );

  return (
    <div className="space-y-6">

      {/* ✅ WARNING BANNER IF STOCK LOW */}
      {isOwner && lowStockMaterials.length > 0 && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-xl flex items-center gap-3 shadow">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <div>
            <strong>{lowStockMaterials.length} bahan baku hampir habis!</strong>
            <p className="text-sm">
              Stok di bawah batas minimum, segera lakukan pembelian bahan.
            </p>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredNav.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center justify-between">
                {card.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Transaction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <TransactionForm
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            onComplete={handleTransactionComplete}
          />
        </div>

        <div className="lg:col-span-3">
          <ProductGrid
            products={products}
            loading={loading}
            onProductSelect={handleProductSelect}
            onRefresh={() => {
              fetchProducts();
              fetchLowStockMaterials();
            }}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
