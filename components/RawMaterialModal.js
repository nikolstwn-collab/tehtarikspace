// components/RawMaterialModal.js
'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RawMaterialModal({ material, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: material?.name || '',
    category: material?.category || '',
    stock: material?.stock || '',
    unit: material?.unit || 'kg',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const units = ['kg', 'gram', 'liter', 'ml', 'pcs', 'bungkus', 'kaleng', 'botol'];

  // ✅ VALIDASI FORM
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = 'Nama bahan wajib diisi';
    else if (formData.name.length < 3)
      newErrors.name = 'Nama terlalu pendek';

    if (!formData.category.trim())
      newErrors.category = 'Kategori wajib diisi';

    if (!String(formData.stock).trim())
      newErrors.stock = 'Stok wajib diisi';
    else if (isNaN(Number(formData.stock)))
      newErrors.stock = 'Stok harus angka';
    else if (Number(formData.stock) < 0)
      newErrors.stock = 'Stok tidak boleh negatif';

    if (!formData.unit.trim())
      newErrors.unit = 'Satuan wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Periksa kembali input yang belum sesuai');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const url = '/api/raw-materials';
      const method = material ? 'PUT' : 'POST';
      const body = material ? { ...formData, id: material.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || err?.message || 'Gagal menyimpan bahan baku');
      }

      toast.success(material ? 'Bahan berhasil diperbarui' : 'Bahan berhasil ditambahkan');
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      toast.error(error.message);
      console.error('❌ RawMaterialModal error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI (tidak diringkas agar full copy–paste)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        {/* HEADER */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {material ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* NAMA */}
          <Field
            label="Nama Bahan"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
            placeholder="Contoh: Susu Kental Manis"
            error={errors.name}
          />

          {/* KATEGORI */}
          <Field
            label="Kategori"
            value={formData.category}
            onChange={(v) => setFormData({ ...formData, category: v })}
            placeholder="Contoh: Bahan Minuman"
            error={errors.category}
          />

          {/* STOK + UNIT */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Stok"
              type="number"
              value={formData.stock}
              onChange={(v) => setFormData({ ...formData, stock: v })}
              error={errors.stock}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Satuan
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.unit ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {errors.unit && (
                <ErrorText message={errors.unit} />
              )}
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Catatan:</strong> Stok akan otomatis berkurang ketika produk terjual sesuai resep.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-tea text-white font-semibold rounded-lg hover:bg-tea-dark transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ✅ FIELD COMPONENT */
function Field({ label, value, onChange, placeholder, type = 'text', error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} *
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <ErrorText message={error} />}
    </div>
  );
}

/* ✅ ERROR TEXT */
function ErrorText({ message }) {
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" /> {message}
    </p>
  );
}
