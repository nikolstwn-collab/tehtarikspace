'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import EmployeeModal from '@/components/EmployeeModal';
import { UserPlus, Search, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';

export default function PegawaiPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isOwner = session?.user?.role === 'OWNER';

  // === Fetch data pegawai ===
  async function fetchEmployees() {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch {
      toast.error('Gagal memuat data pegawai');
    }
  }

  // === Fetch absensi hari ini ===
  async function fetchAttendance() {
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      const today = new Date().toISOString().split('T')[0];

      const map = {};
      data.forEach((a) => {
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

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, []);

  // === Handle Absen Hari Ini ===
  async function handleAttendance(id) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: id, status: 'HADIR' }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Pegawai sudah absen hari ini');
        return;
      }

      toast.success('Absensi berhasil disimpan!');
      fetchAttendance();
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menyimpan absensi');
    }
  }

  // === Hapus Pegawai ===
  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus pegawai ini?')) return;
    const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Pegawai dihapus');
      fetchEmployees();
    } else {
      toast.error('Gagal menghapus pegawai');
    }
  }

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Pegawai</h1>
          <p className="text-gray-500 text-sm">
            Lihat jadwal shift dan lakukan absensi harianmu.
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
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-tea focus:border-transparent"
            />
          </div>

          {isOwner && (
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-tea text-white px-4 py-2 rounded-lg hover:bg-tea-dark transition"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Pegawai
            </button>
          )}
        </div>
      </div>

      {/* GRID KARYAWAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12 border border-dashed rounded-xl">
            Tidak ada pegawai ditemukan.
          </div>
        ) : (
          filtered.map((emp) => {
            const status = attendance[emp.id];
            const isHadir = status === 'HADIR';

            return (
              <div
                key={emp.id}
                className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="h-32 bg-gray-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={emp.photoUrl || 'https://via.placeholder.com/150?text=No+Photo'}
                    alt={emp.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{emp.name}</h3>
                  <p className="text-gray-500 text-sm">{emp.position}</p>
                  <p className="text-sm text-gray-600">📞 {emp.phone}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Shift: {emp.shifts?.[0]?.shiftTime || 'Belum diatur'}
                  </div>

                  {/* Tombol Absensi */}
                  <div className="mt-3">
                    <button
                      onClick={() => handleAttendance(emp.id)}
                      disabled={isHadir}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                        isHadir
                          ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                      }`}
                    >
                      {isHadir ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Hadir
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Belum Absen
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tombol Aksi Owner */}
                {isOwner && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowModal(true);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah/Edit Pegawai */}
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
