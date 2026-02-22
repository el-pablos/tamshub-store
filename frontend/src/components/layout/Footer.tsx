import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-white">TamsHub Store</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Platform top up game dan layanan digital terpercaya, cepat, dan aman.
              Proses otomatis 24/7 dengan harga bersaing.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Layanan</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Semua Produk
                </Link>
              </li>
              <li>
                <Link href="/cek-transaksi" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cek Transaksi
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Informasi</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/syarat-ketentuan" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} TamsHub Store. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500" /> in Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
