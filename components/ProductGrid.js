// components/ProductGrid.js
'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import ProductModal from './ProductModal';
import toast from 'react-hot-toast';

export default function ProductGrid({ products, loading, onProductSelect, onRefresh, isOwner }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const categories = [
    { value: 'ALL', label: 'Semua' },
    { value: 'TEH_TARIK', label: 'Teh Tarik' },
    { value: 'MAKANAN', label: 'Makanan' },
    { value: 'SNACK', label: 'Snack' },
    { value: 'MINUMAN_LAIN', label: 'Minuman Lain' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Yakin ingin menghapus produk "${product.name}"?`)) return;

    try {
      const response = await fetch(`/api/products?id=${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Gagal menghapus produk');

      toast.success('Produk berhasil dihapus');
      onRefresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    onRefresh();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tea rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Kelola Produk</h2>
              <p className="text-sm text-gray-500">{filteredProducts.length} produk tersedia</p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-tea text-white rounded-lg hover:bg-tea-dark transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Produk</span>
            </button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              <div 
                onClick={() => !isOwner && onProductSelect(product)}
                className="relative"
              >
                <img
                  src={product.photoUrl || 'https://via.placeholder.com/200'}
                  alt={product.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold">
                  Stok: {product.stock}
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2 truncate">{product.category.replace('_', ' ')}</p>
                <p className="text-lg font-bold text-tea">
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </p>

                {isOwner && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}

                {!isOwner && (
                  <button
                    onClick={() => onProductSelect(product)}
                    className="w-full mt-3 py-2 bg-tea text-white rounded-lg hover:bg-tea-dark transition text-sm font-medium"
                  >
                    Pilih
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}