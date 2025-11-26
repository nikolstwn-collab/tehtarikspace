// app/login/page.js
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Coffee, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username tidak boleh kosong.');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password wajib diisi.');
      return false;
    }
    if (formData.password.length < 4) {
      setError('Password minimal 4 karakter.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'User not found') {
          setError('Akun tidak ditemukan. Periksa username Anda.');
        } else if (result.error === 'Invalid password') {
          setError('Password salah. Silakan coba lagi.');
        } else {
          setError('Login gagal. Silakan coba kembali.');
        }
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Tidak dapat menghubungi server. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tea-dark via-tea to-tea-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cream rounded-2xl mb-4 shadow-xl">
            <Coffee className="w-12 h-12 text-tea-dark" />
          </div>
          <h1 className="text-4xl font-bold text-cream mb-2">Teh Tarik Space</h1>
          <p className="text-cream-dark">Sistem Pengelolaan & Kasir Terintegrasi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login ke Sistem</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg transition focus:ring-2 focus:ring-tea focus:border-transparent ${
                  error && !formData.username ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Masukkan username"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg transition focus:ring-2 focus:ring-tea focus:border-transparent ${
                  error && !formData.password ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Masukkan password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-tea hover:bg-tea-dark text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Kredensial Demo:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700 mb-1">Owner</p>
                <p className="text-gray-600">owner / owner123</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-700 mb-1">Karyawan</p>
                <p className="text-gray-600">karyawan / karyawan123</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-cream-dark text-sm mt-6">
          © 2025 Teh Tarik Space. Semua hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
