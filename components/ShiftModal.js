// components/ShiftModal.js
'use client';

import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShiftModal({ employeeId, shifts, onClose, onSuccess }) {
  const [editingShifts, setEditingShifts] = useState(shifts);
  const [loading, setLoading] = useState(false);

  const dayOrder = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];
  
  const sortedShifts = [...editingShifts].sort((a, b) => 
    dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
  );

  const handleUpdateShift = (shiftId, field, value) => {
    setEditingShifts(editingShifts.map(shift => 
      shift.id === shiftId ? { ...shift, [field]: value } : shift
    ));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const promises = editingShifts.map(shift => 
        fetch('/api/shifts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: shift.id,
            shiftTime: shift.shiftTime,
            isActive: shift.isActive,
          }),
        })
      );

      await Promise.all(promises);
      toast.success('Jadwal shift berhasil diupdate');
      onSuccess();
    } catch (error) {
      toast.error('Gagal mengupdate shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-tea" />
            <h3 className="text-xl font-bold text-gray-800">Kelola Jadwal Shift</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shifts List */}
        <div className="p-6 space-y-3">
          {sortedShifts.map((shift) => (
            <div
              key={shift.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-tea transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24">
                  <span className="font-semibold text-gray-800">{shift.dayOfWeek}</span>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={shift.shiftTime}
                    onChange={(e) => handleUpdateShift(shift.id, 'shiftTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea focus:border-transparent"
                    placeholder="08:00 - 16:00"
                  />
                </div>

                <div className="flex-shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shift.isActive}
                      onChange={(e) => handleUpdateShift(shift.id, 'isActive', e.target.checked)}
                      className="w-5 h-5 text-tea rounded focus:ring-tea"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="px-6 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 <strong>Tips:</strong> Centang "Aktif" untuk hari kerja, kosongkan untuk hari libur. 
              Format waktu: HH:MM - HH:MM (contoh: 08:00 - 16:00)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-tea text-white font-semibold rounded-lg hover:bg-tea-dark transition disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}