'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import EmployeeModal from '@/components/EmployeeModal';
import {
  UserPlus,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Upload,
} from 'lucide-react';

export default function PegawaiPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isOwner = session?.user?.role === 'OWNER';

  // ================= FETCH PEGAWAI =================
  async function fetchEmployees() {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (Array.isArray(data)) setEmployees(data);
      else setEmployees([]);
    } catch {
      toast.error('Gagal memuat data pegawai');
    }
  }

  // ================= FETCH ABSENSI =================
  async function fetchAttendance() {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();

      if (!Array.isArray(data)) {
        setAttendance({});
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const map = {};

      data.forEach((a) => {
        if (!a?.date || !a?.employeeId) return;
        const date = new Date(a.date).toISOString().split('T')[0];
        if (date === today) {
          map[a.employeeId] = a.status;
        }
      });

      setAttendance(map);
    } catch {
      toast.error('Gagal memuat absensi');
    }
  }

  // ================= ABSENSI =================
  async function handleAttendance(employeeId) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Gagal absen');
        return;
      }

      toast.success('Absensi berhasil');
      fetchAttendance();
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat absensi');
    }
  }

  // ================= UPLOAD EXCEL =================
  async function handleUploadExcel(e) {
    e.preventDefault();

    if (!uploadFile) {
      toast.error('Pilih file Excel terlebih dahulu');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await fetch('/api/employees/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal upload file');
        return;
      }

      toast.success('Import pegawai berhasil');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchEmployees();
      fetchAttendance();
    } catch {
      toast.error('Terjadi kesalahan saat upload');
    }
  }

  // ================= DELETE =================
  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus pegawai ini?')) return;

    const res = await fetch(`/api/employees?id=${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      toast.success('Pegawai dihapus');
      fetchEmployees();
    } else {
      toast.error('Gagal menghapus pegawai');
    }
  }

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= UI =================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Pegawai</h1>
          <p className="text-gray-500 text-sm">
            Lihat jadwal shift dan lakukan absensi harian.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {isOwner && (
            <>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                <Upload className="w-4 h-4" /> Upload Excel
              </button>

              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-tea text-white px-4 py-2 rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                Tambah Pegawai
              </button>
            </>
          )}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12">
            Tidak ada pegawai
          </div>
        ) : (
          filtered.map((emp) => {
            const status = attendance?.[emp.id] ?? null;
            const isHadir = status === 'HADIR';

            return (
              <div
                key={emp.id}
                className="relative bg-white border rounded-xl"
              >
                <div className="h-32 bg-gray-100">
                  <img
                    src={
                      emp.photoUrl ||
                      'https://via.placeholder.com/150?text=No+Photo'
                    }
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold">{emp.name}</h3>
                  <p className="text-sm text-gray-500">{emp.position}</p>

                  <button
                    onClick={() => handleAttendance(emp.id)}
                    disabled={isHadir}
                    className={`mt-3 w-full py-2 rounded-lg ${
                      isHadir
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isHadir ? 'Hadir' : 'Belum Absen'}
                  </button>
                </div>

                {isOwner && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowModal(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchEmployees();
            fetchAttendance();
          }}
          currentUserRole={session?.user?.role}
        />
      )}
    </div>
  );
}