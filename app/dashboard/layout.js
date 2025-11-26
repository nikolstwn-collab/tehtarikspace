'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Proteksi halaman agar tidak bisa diakses tanpa login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth'); // gunakan replace biar tidak bisa back
    }
  }, [status, router]);

  // Saat status masih "loading", tampilkan animasi loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Kalau user sudah login baru render layout dashboard
  if (status === 'authenticated' && session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          user={session.user}
        />

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={session.user}
        />

        <main className="pt-16">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#8B4513',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    );
  }

  // Jika tidak ada session, jangan render apapun (biar efek redirect bersih)
  return null;
}
