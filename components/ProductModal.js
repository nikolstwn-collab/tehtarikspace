'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductModal({ product, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || 'TEH_TARIK',
    photoUrl: product?.photoUrl || '',
  });

  const [recipes, setRecipes] = useState(product?.recipes || []);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'TEH_TARIK', label: 'Teh Tarik' },
    { value: 'MAKANAN', label: 'Makanan' },
    { value: 'SNACK', label: 'Snack' },
    { value: 'MINUMAN_LAIN', label: 'Minuman Lain' },
  ];

  // 🔹 Ambil bahan baku dari DB
  useEffect(() => {
    fetch('/api/raw-materials')
      .then((res) => res.json())
      .then((data) => setRawMaterials(data))
      .catch(() => toast.error('Gagal memuat bahan baku'));
  }, []);

  // 🔹 Tambah baris bahan baku
  const addRecipeRow = () => {
    setRecipes([...recipes, { rawMaterialId: '', quantityNeeded: '' }]);
  };

  // 🔹 Hapus baris bahan baku
  const removeRecipeRow = (index) => {
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  // 🔹 Update isi baris bahan
  const updateRecipe = (index, key, value) => {
    const updated = [...recipes];
    updated[index][key] = value;
    setRecipes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/products';
      const method = product ? 'PUT' : 'POST';
      const body = product
        ? { ...formData, id: product.id, recipes }
        : { ...formData, recipes };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Gagal menyimpan produk');
      toast.success(product ? 'Produk diupdate' : 'Produk ditambahkan');
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nama, Harga, Stok, Kategori, Foto */}
          {['name', 'price', 'stock'].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2 capitalize">{field}</label>
              <input
                type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                required
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL Foto</label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* 🔹 BAGIAN BARU: RESEP PRODUK */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-3">Resep Produk (Komposisi)</h4>
            {recipes.map((recipe, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <select
                  value={recipe.rawMaterialId}
                  onChange={(e) => updateRecipe(index, 'rawMaterialId', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg"
                >
                  <option value="">Pilih bahan baku...</option>
                  {rawMaterials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Qty"
                  value={recipe.quantityNeeded}
                  onChange={(e) => updateRecipe(index, 'quantityNeeded', e.target.value)}
                  className="w-28 px-3 py-2 border rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => removeRecipeRow(index)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRecipeRow}
              className="flex items-center gap-2 text-tea font-medium hover:text-tea-dark"
            >
              <Plus className="w-4 h-4" /> Tambah Bahan
            </button>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-tea text-white font-semibold rounded-lg hover:bg-tea-dark transition"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
