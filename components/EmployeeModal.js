// components/EmployeeModal.js
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];

export default function EmployeeModal({ employee, onClose, onSuccess, currentUserRole }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    birthDate: employee?.birthDate ? format(new Date(employee.birthDate), 'yyyy-MM-dd') : '',
    address: employee?.address || '',
    gender: employee?.gender || 'L',
    phone: employee?.phone || '',
    position: employee?.position || '',
    photoUrl: employee?.photoUrl || '',
    shiftType: 'PAGI',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [shifts, setShifts] = useState(() =>
    DAYS.map((d) => ({
      dayOfWeek: d,
      shiftTime: '07:00 - 17:00',
      isActive: true,
    }))
  );

  useEffect(() => {
    if (employee?.shifts) {
      setShifts(
        DAYS.map((d) => {
          const s = employee.shifts.find((x) => x.dayOfWeek === d);
          return {
            id: s?.id || null,
            dayOfWeek: d,
            shiftTime: s?.shiftTime || '07:00 - 17:00',
            isActive: s?.isActive ?? true,
          };
        })
      );
    }
  }, [employee]);

  // ✅ VALIDASI FORM
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.length < 3)
      newErrors.name = 'Nama minimal 3 karakter';

    if (!formData.birthDate)
      newErrors.birthDate = 'Tanggal lahir wajib diisi';
    else if (new Date(formData.birthDate) > new Date())
      newErrors.birthDate = 'Tanggal lahir tidak valid';

    if (!formData.address.trim())
      newErrors.address = 'Alamat wajib diisi';

    if (!formData.phone.trim() || !/^(\+62|08)[0-9]{8,13}$/.test(formData.phone))
      newErrors.phone = 'Nomor HP tidak valid';

    if (!formData.position.trim())
      newErrors.position = 'Posisi wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Periksa kembali input yang belum sesuai");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const isEdit = !!employee?.id;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        id: employee?.id,
        ...formData,
        shifts,
      };

      const res = await fetch('/api/employees', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || err?.message || 'Gagal menyimpan pegawai');
      }

      toast.success(isEdit ? 'Pegawai berhasil diperbarui' : 'Pegawai berhasil ditambahkan');
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ COMPONENT UI — tidak diringkas agar full copy–paste
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-fadeIn">
        {/* HEADER */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {employee ? 'Edit Pegawai' : 'Tambah Pegawai'}
          </h3>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* === INPUTS DENGAN ERROR INDICATION === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Field
              label="Nama Lengkap"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              error={errors.name}
            />

            <Field
              type="date"
              label="Tanggal Lahir"
              value={formData.birthDate}
              onChange={(v) => setFormData({ ...formData, birthDate: v })}
              error={errors.birthDate}
            />

            <FieldTextarea
              label="Alamat"
              value={formData.address}
              onChange={(v) => setFormData({ ...formData, address: v })}
              error={errors.address}
            />

            <Field
              label="No. HP"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
              error={errors.phone}
            />

            <Field
              label="Posisi"
              value={formData.position}
              onChange={(v) => setFormData({ ...formData, position: v })}
              error={errors.position}
            />

            {/* FOTO PREVIEW */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">URL Foto (Opsional)</label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
              {formData.photoUrl && (
                <img
                  src={formData.photoUrl}
                  className="w-28 h-28 object-cover mt-2 rounded-md border"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                    toast.error('URL foto tidak valid');
                  }}
                />
              )}
            </div>
          </div>

          {/* SHIFT SECTION (OWNER ONLY) */}
          {currentUserRole === 'OWNER' && (
            <ShiftSection
              shifts={shifts}
              formData={formData}
              applyShiftPreset={(t) => {
                const shiftTime = t === 'MALAM' ? '17:00 - 23:00' : '07:00 - 17:00';
                setShifts(shifts.map((s) => ({ ...s, shiftTime, isActive: true })));
                setFormData({ ...formData, shiftType: t });
              }}
              onShiftChange={(idx, k, v) => {
                const updated = [...shifts];
                updated[idx][k] = v;
                setShifts(updated);
              }}
            />
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 border rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-tea text-white rounded-lg hover:bg-tea-dark transition flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ✅ INPUT FIELD COMPONENT */
function Field({ label, value, onChange, type = "text", error }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ✅ TEXTAREA FIELD */
function FieldTextarea({ label, value, onChange, error }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        rows="2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ✅ SHIFT MANAGEMENT SECTION */
function ShiftSection({ shifts, formData, applyShiftPreset, onShiftChange }) {
  return (
    <div className="border-t pt-4 space-y-3">
      <h4 className="font-semibold text-gray-800">Atur Jadwal Shift</h4>

      {/* PRESET */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => applyShiftPreset('PAGI')}
          className={`px-3 py-2 rounded-lg border ${
            formData.shiftType === 'PAGI'
              ? 'bg-green-500 text-white'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          Shift Pagi
        </button>

        <button
          type="button"
          onClick={() => applyShiftPreset('MALAM')}
          className={`px-3 py-2 rounded-lg border ${
            formData.shiftType === 'MALAM'
              ? 'bg-indigo-500 text-white'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          Shift Malam
        </button>
      </div>

      {/* EDIT PER DAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {shifts.map((s, i) => (
          <div
            key={s.dayOfWeek}
            className={`flex items-center gap-2 border rounded-md p-2 ${
              !s.isActive && 'opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={s.isActive}
              onChange={(e) => onShiftChange(i, 'isActive', e.target.checked)}
            />

            <div className="flex-1">
              <div className="font-medium">{s.dayOfWeek}</div>
              <input
                type="text"
                value={s.shiftTime}
                onChange={(e) => onShiftChange(i, 'shiftTime', e.target.value)}
                className="w-full px-2 py-1 border rounded-md text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
