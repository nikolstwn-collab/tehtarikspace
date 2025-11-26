'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PembelianPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    id: null,
    itemName: '',
    quantity: '',
    category: '',
    totalAmount: '',
  });

  const [showForm, setShowForm] = useState(false);

  // 🔹 Ambil data pembelian dari API
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchases');
      const data = await response.json();
      setPurchases(Array.isArray(data) ? data : []); // ✅ pastikan array
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Gagal memuat data pembelian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  // 🔹 Simpan data pembelian (baru / edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = formData.id ? 'PUT' : 'POST';
      const response = await fetch('/api/purchases', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Gagal menyimpan transaksi');

      toast.success('Transaksi pembelian berhasil disimpan');
      setFormData({ id: null, itemName: '', quantity: '', category: '', totalAmount: '' });
      setShowForm(false);
      fetchPurchases();
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast.error('Terjadi kesalahan saat menyimpan');
    }
  };

  // 🔹 Hapus pembelian
  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      const response = await fetch(`/api/purchases?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus');
      toast.success('Berhasil dihapus');
      fetchPurchases();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Terjadi kesalahan saat menghapus');
    }
  };

  // 🔹 Filter data berdasarkan pencarian
  const filteredPurchases = Array.isArray(purchases)
    ? purchases.filter((purchase) =>
        purchase.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="w-6 h-6" /> Transaksi Pembelian
      </h1>

      {/* 🔍 Pencarian + Tombol Tambah */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Cari nama barang atau kategori..."
          className="border px-3 py-2 rounded-md w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" /> Tambah Pembelian
        </button>
      </div>

      {/* 🧾 Form Pembelian */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Barang"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              className="border px-3 py-2 rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Jumlah"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="border px-3 py-2 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border px-3 py-2 rounded-md"
              required
            />
            <input
              type="number"
              placeholder="Total Harga"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              className="border px-3 py-2 rounded-md"
              required
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ id: null, itemName: '', quantity: '', category: '', totalAmount: '' });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* 📊 Tabel Pembelian */}
      {loading ? (
        <p>Memuat data...</p>
      ) : filteredPurchases.length === 0 ? (
        <p className="text-gray-500">Belum ada transaksi pembelian</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-3 py-2 text-left">Nama Barang</th>
              <th className="border px-3 py-2 text-left">Kategori</th>
              <th className="border px-3 py-2 text-center">Jumlah</th>
              <th className="border px-3 py-2 text-right">Total Harga</th>
              <th className="border px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{purchase.itemName}</td>
                <td className="border px-3 py-2">{purchase.category}</td>
                <td className="border px-3 py-2 text-center">{purchase.quantity}</td>
                <td className="border px-3 py-2 text-right">
                  Rp {parseFloat(purchase.totalAmount).toLocaleString('id-ID')}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => {
                      setFormData(purchase);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(purchase.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
