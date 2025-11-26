// components/TopBar.js
'use client';

import { Menu, Coffee, User } from 'lucide-react';

export default function TopBar({ onMenuClick, user }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-tea rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-tea-dark">Teh Tarik Space</h1>
              <p className="text-xs text-gray-500">Sistem POS</p>
            </div>
          </div>
        </div>

        {/* Right: User Info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <div className="w-10 h-10 bg-tea rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}