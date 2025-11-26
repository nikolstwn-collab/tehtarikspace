'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarDays,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState('penjualan');
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [omzetData, setOmzetData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, purchasesRes, attendanceRes] = await Promise.all([
          fetch('/api/reports/sales'),
          fetch('/api/reports/purchase'),
          fetch('/api/attendance'),
        ]);

        const salesRaw = await salesRes.json();
        const purchasesRaw = await purchasesRes.json();
        const attendanceRaw = await attendanceRes.json();

        // 🔧 Fix angka besar
        const sales = salesRaw.map((s) => ({
          ...s,
          total: Number(s.total) || 0,
        }));
        const purchases = purchasesRaw.map((p) => ({
          ...p,
          total: Number(p.total) || 0,
        }));

        setSalesData(sales);
        setPurchaseData(purchases);
        setAttendanceData(attendanceRaw);

        // Hitung omzet
        const omzetMap = {};
        sales.forEach((s) => {
          if (!omzetMap[s.tanggal])
            omzetMap[s.tanggal] = { tanggal: s.tanggal, penjualan: 0, pembelian: 0 };
          omzetMap[s.tanggal].penjualan += s.total;
        });
        purchases.forEach((p) => {
          if (!omzetMap[p.tanggal])
            omzetMap[p.tanggal] = { tanggal: p.tanggal, penjualan: 0, pembelian: 0 };
          omzetMap[p.tanggal].pembelian += p.total;
        });
        const omzetArr = Object.values(omzetMap).map((o) => ({
          ...o,
          omzet: o.penjualan - o.pembelian,
        }));
        setOmzetData(omzetArr);
      } catch (err) {
        console.error(err);
        showToast('Gagal memuat laporan');
      }
    }
    fetchData();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const getTotalSales = () =>
    salesData.reduce((sum, item) => sum + (item.total || 0), 0);
  const getTotalPurchases = () =>
    purchaseData.reduce((sum, item) => sum + (item.total || 0), 0);
  const getTotalOmzet = () => getTotalSales() - getTotalPurchases();

  const salesChartData = salesData.reduce((acc, item) => {
    const found = acc.find((x) => x.tanggal === item.tanggal);
    if (found) found.total += item.total;
    else acc.push({ tanggal: item.tanggal, total: item.total });
    return acc;
  }, []);

  const purchaseChartData = purchaseData.reduce((acc, item) => {
    const found = acc.find((x) => x.tanggal === item.tanggal);
    if (found) found.total += item.total;
    else acc.push({ tanggal: item.tanggal, total: item.total });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-6">
      {toast.show && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Laporan Keuangan & Absensi
              </h1>
              <p className="text-amber-100 text-sm">
                Laporan penjualan, pembelian, omzet & kehadiran pegawai
              </p>
            </div>
            <button
              onClick={() => showToast('Laporan berhasil diunduh!')}
              className="flex items-center bg-white text-amber-700 px-5 py-2.5 rounded-lg hover:bg-amber-50 transition shadow-md font-medium"
            >
              <Download className="w-5 h-5 mr-2" />
              Unduh CSV
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-amber-50">
            <SummaryCard
              title="Total Penjualan"
              value={getTotalSales()}
              color="green"
              icon={<TrendingUp className="w-8 h-8 text-green-500" />}
            />
            <SummaryCard
              title="Total Pembelian"
              value={getTotalPurchases()}
              color="red"
              icon={<TrendingDown className="w-8 h-8 text-red-500" />}
            />
            <SummaryCard
              title="Total Omzet"
              value={getTotalOmzet()}
              color="blue"
              icon={<DollarSign className="w-8 h-8 text-blue-500" />}
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b px-6 bg-white overflow-x-auto">
            {[
              ['penjualan', '📊 Penjualan'],
              ['pembelian', '🛒 Pembelian'],
              ['omzet', '💰 Omzet'],
              ['absensi', '📅 Absensi'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === key
                    ? 'border-b-2 border-amber-600 text-amber-700'
                    : 'text-gray-500 hover:text-amber-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* === TAB CONTENT === */}
          {activeTab === 'penjualan' && (
            <TabPenjualan data={salesChartData} salesData={salesData} total={getTotalSales()} />
          )}
          {activeTab === 'pembelian' && (
            <TabPembelian data={purchaseChartData} purchaseData={purchaseData} total={getTotalPurchases()} />
          )}
          {activeTab === 'omzet' && (
            <TabOmzet data={omzetData} totalSales={getTotalSales()} totalPurchases={getTotalPurchases()} totalOmzet={getTotalOmzet()} />
          )}
          {activeTab === 'absensi' && <TabAbsensi attendanceData={attendanceData} />}
        </div>
      </div>
    </div>
  );
}

/* === SUB COMPONENTS === */
function SummaryCard({ title, value, icon, color }) {
  const colors = {
    green: 'text-green-600 border-green-500',
    red: 'text-red-600 border-red-500',
    blue: 'text-blue-600 border-blue-500',
  };
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${colors[color].split(' ')[0]}`}>
            Rp {value.toLocaleString('id-ID')}
          </p>
        </div>
        {icon}
      </div>
    </div>
  );
}

/* === PENJUALAN === */
function TabPenjualan({ data, salesData, total }) {
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Penjualan Harian</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tanggal" />
            <YAxis />
            <Tooltip formatter={(v) => `Rp ${v.toLocaleString('id-ID')}`} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Penjualan" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <TransactionTable data={salesData} total={total} type="penjualan" />
    </div>
  );
}

/* === PEMBELIAN === */
function TabPembelian({ data, purchaseData, total }) {
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Pembelian Harian</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tanggal" />
            <YAxis />
            <Tooltip formatter={(v) => `Rp ${v.toLocaleString('id-ID')}`} />
            <Legend />
            <Bar dataKey="total" fill="#ef4444" name="Pembelian" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <TransactionTable data={purchaseData} total={total} type="pembelian" />
    </div>
  );
}

/* === OMZET === */
function TabOmzet({ data, totalSales, totalPurchases, totalOmzet }) {
  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Omzet Harian</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tanggal" />
            <YAxis />
            <Tooltip formatter={(v) => `Rp ${v.toLocaleString('id-ID')}`} />
            <Legend />
            <Line type="monotone" dataKey="penjualan" stroke="#10b981" strokeWidth={2} name="Penjualan" />
            <Line type="monotone" dataKey="pembelian" stroke="#ef4444" strokeWidth={2} name="Pembelian" />
            <Line type="monotone" dataKey="omzet" stroke="#3b82f6" strokeWidth={3} name="Omzet" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <OmzetTable data={data} totalSales={totalSales} totalPurchases={totalPurchases} totalOmzet={totalOmzet} />
    </div>
  );
}

/* === ABSENSI === */
function TabAbsensi({ attendanceData }) {
  const totalHadirBulan = attendanceData.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getMonth() === new Date().getMonth() &&
      d.getFullYear() === new Date().getFullYear() &&
      a.status === 'HADIR'
    );
  }).length;

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData.filter(
    (a) => a.date.split('T')[0] === today
  );

  return (
    <div className="p-6 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="text-gray-700 font-semibold">Total Hadir Bulan Ini</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {totalHadirBulan} Kehadiran
          </p>
        </div>
        <CalendarDays className="w-10 h-10 text-amber-500" />
      </div>

      <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">
          Kehadiran Hari Ini ({new Date().toLocaleDateString('id-ID')})
        </h4>
        {todayAttendance.length === 0 ? (
          <p className="text-gray-500 text-sm">Belum ada data absensi hari ini.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayAttendance.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  a.status === 'HADIR'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}
              >
                <div>
                  <p className="font-semibold">{a.employee?.name || '-'}</p>
                  <p className="text-sm">{a.status}</p>
                </div>
                {a.status === 'HADIR' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-600" /> Riwayat Absensi Pegawai
        </h3>
        {attendanceData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 border border-dashed rounded-xl">
            Belum ada data absensi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">
                    Nama Pegawai
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Tanggal</th>
                  <th className="px-6 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50 transition">
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {item.employee?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(item.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.status === 'HADIR'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* === TABELS === */
function TransactionTable({ data, total, type }) {
  const isSales = type === 'penjualan';
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead
          className={`${
            isSales
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-red-500 to-rose-500'
          } text-white`}
        >
          <tr>
            <th className="px-6 py-3 text-left">Tanggal</th>
            <th className="px-6 py-3 text-left">
              {isSales ? 'Produk' : 'Item'}
            </th>
            <th className="px-6 py-3 text-center">Jumlah</th>
            <th className="px-6 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">{item.tanggal}</td>
              <td className="px-6 py-4">
                {isSales ? item.produk : item.item}
              </td>
              <td className="px-6 py-4 text-center">{item.jumlah}</td>
              <td className="px-6 py-4 text-right font-semibold">
                Rp {item.total.toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan="3" className="px-6 py-3 text-right font-semibold">
              Total
            </td>
            <td className="px-6 py-3 text-right text-lg font-bold text-green-600">
              Rp {total.toLocaleString('id-ID')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function OmzetTable({ data, totalSales, totalPurchases, totalOmzet }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left">Tanggal</th>
            <th className="px-6 py-3 text-right">Penjualan</th>
            <th className="px-6 py-3 text-right">Pembelian</th>
            <th className="px-6 py-3 text-right">Omzet</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.tanggal} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4">{item.tanggal}</td>
              <td className="px-6 py-4 text-right text-green-600">
                Rp {item.penjualan.toLocaleString('id-ID')}
              </td>
              <td className="px-6 py-4 text-right text-red-600">
                Rp {item.pembelian.toLocaleString('id-ID')}
              </td>
              <td
                className={`px-6 py-4 text-right font-bold ${
                  item.omzet >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}
              >
                Rp {item.omzet.toLocaleString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="px-6 py-3 text-right font-semibold">Total</td>
            <td className="px-6 py-3 text-right text-green-600 font-bold">
              Rp {totalSales.toLocaleString('id-ID')}
            </td>
            <td className="px-6 py-3 text-right text-red-600 font-bold">
              Rp {totalPurchases.toLocaleString('id-ID')}
            </td>
            <td
              className={`px-6 py-3 text-right text-lg font-bold ${
                totalOmzet >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              Rp {totalOmzet.toLocaleString('id-ID')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
