// app/(dashboard)/bahan-baku/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import RawMaterialModal from '@/components/RawMaterialModal';

export default function BahanBakuPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not owner
  useEffect(() => {
    if (session && session.user.role !== 'OWNER') {
      toast.error('Halaman ini hanya untuk Owner');
      router.push('/');
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user.role === 'OWNER') {
      fetchMaterials();
    }
  }, [session]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/raw-materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      toast.error('Gagal memuat bahan baku');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowModal(true);
  };

  const handleDelete = async (material) => {
    if (!confirm(`Yakin ingin menghapus bahan "${material.name}"?`)) return;

    try {
      const response = await fetch(`/api/raw-materials?id=${material.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Gagal menghapus bahan');

      toast.success('Bahan berhasil dihapus');
      fetchMaterials();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMaterial(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    fetchMaterials();
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (session?.user.role !== 'OWNER') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tea rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kelola Bahan Baku</h1>
              <p className="text-sm text-gray-500">Tracking stok bahan untuk produksi</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-tea text-white rounded-lg hover:bg-tea-dark transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Bahan</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama bahan atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea focus:border-transparent"
          />
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-12 h-12 border-4 border-tea border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Belum ada bahan baku</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const isLowStock = Number(material.stock) < 10;
            
            return (
              <div
                key={material.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{material.name}</h3>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      {material.category}
                    </span>
                  </div>
                  {isLowStock && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" title="Stok rendah" />
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Stok:</span>
                    <span className={`text-2xl font-bold ${isLowStock ? 'text-orange-600' : 'text-tea-dark'}`}>
                      {Number(material.stock)} {material.unit}
                    </span>
                  </div>

                  {material.recipes && material.recipes.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Digunakan untuk:</p>
                      <div className="flex flex-wrap gap-1">
                        {material.recipes.slice(0, 3).map((recipe, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {recipe.product?.name}
                          </span>
                        ))}
                        {material.recipes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{material.recipes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(material)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(material)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <RawMaterialModal
          material={editingMaterial}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}