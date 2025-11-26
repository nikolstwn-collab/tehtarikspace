// components/Sidebar.js
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { 
  Home, 
  ShoppingCart, 
  Users, 
  Package, 
  FileText, 
  LogOut, 
  X,
  Coffee
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, user }) {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      href: '/dashboard', 
      roles: ['OWNER', 'KARYAWAN'] 
    },
    { 
      name: 'Transaksi Pembelian', 
      icon: ShoppingCart, 
      href: '/dashboard/pembelian', 
      roles: ['OWNER', 'KARYAWAN'] 
    },
    { 
      name: 'Kelola Pegawai', 
      icon: Users, 
      href: '/dashboard/pegawai', 
      roles: ['OWNER', 'KARYAWAN'] 
    },
    { 
      name: 'Kelola Bahan Baku', 
      icon: Package, 
      href: '/dashboard/bahan-baku', 
      roles: ['OWNER'] 
    },
    { 
      name: 'Laporan', 
      icon: FileText, 
      href: '/dashboard/laporan', 
      roles: ['OWNER', 'KARYAWAN'] 
    },
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth' });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-tea-dark to-tea text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-tea-light/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-tea-dark" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Teh Tarik Space</h2>
                  <p className="text-xs text-cream-dark">POS System</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-tea-light/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive 
                        ? 'bg-cream text-tea-dark font-semibold' 
                        : 'text-cream hover:bg-tea-light/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-tea-light/20">
            <div className="bg-tea-light/10 rounded-lg p-4 mb-3">
              <p className="text-xs text-cream-dark mb-1">Login sebagai</p>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-cream-dark capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}