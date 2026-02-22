'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { ShuffleText } from '@/components/effects';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/products', label: 'Produk' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/cek-transaksi', label: 'Cek Transaksi' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <ShuffleText
              text="TamsHub"
              className="text-xl font-bold text-white"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth & Cart */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Admin Panel"
                  >
                    <Shield size={20} />
                  </Link>
                )}
                <Link
                  href="/history"
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Riwayat"
                >
                  <ShoppingCart size={20} />
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <User size={16} />
                  <span>{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-gray-300 hover:text-white py-2 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-800" />
            {isAuthenticated ? (
              <>
                <Link
                  href="/history"
                  onClick={() => setMobileOpen(false)}
                  className="block text-gray-300 hover:text-white py-2 text-sm"
                >
                  Riwayat Transaksi
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block text-yellow-400 hover:text-yellow-300 py-2 text-sm"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block text-red-400 hover:text-red-300 py-2 text-sm w-full text-left"
                >
                  Logout ({user?.name})
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
