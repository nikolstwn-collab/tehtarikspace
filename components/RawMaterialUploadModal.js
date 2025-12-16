'use client';

import { useState } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function EmployeeUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Pilih file terlebih dahulu");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("/api/bahan-baku/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) return toast.error("Gagal upload file");

    toast.success("Data pegawai berhasil diimport");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Import Data Pegawai</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X />
          </button>
        </div>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border border-gray-300 rounded-lg p-2"
        />

        <div className="flex gap-3 mt-6">
          <button className="flex-1 p-3 border rounded-lg" onClick={onClose}>
            Batal
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 bg-tea text-white p-3 rounded-lg flex justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {loading ? "Mengupload..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
