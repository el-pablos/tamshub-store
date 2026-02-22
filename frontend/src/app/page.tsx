'use client';

import Link from 'next/link';
import { Search, Zap, Shield, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useCategories, useProducts, useSiteStats } from '@/hooks/useApi';
import { ShuffleText, CountUp, LaserFlow, ElectricBorder } from '@/components/effects';
import { Loading, ErrorState } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: prodLoading } = useProducts({ search: searchQuery || undefined });
  const { data: stats } = useSiteStats();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <LaserFlow className="absolute inset-0" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <ShuffleText
              text="Top Up Game Instan"
              className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            />
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Platform top up game dan layanan digital terpercaya. Proses otomatis 24/7, harga bersaing, dan aman.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Cari game atau layanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all backdrop-blur-sm"
            />
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp end={stats.total_orders} suffix="+" />
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">Transaksi</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <CountUp end={stats.total_products} suffix="+" />
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">Produk</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-400">
                  <CountUp end={stats.success_rate} suffix="%" />
                </div>
                <p className="text-gray-500 text-xs sm:text-sm">Sukses Rate</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'Proses Instan', desc: 'Otomatis 24/7' },
            { icon: Shield, title: 'Aman & Terpercaya', desc: 'Transaksi terenkripsi' },
            { icon: Clock, title: 'Support 24 Jam', desc: 'Bantuan kapan saja' },
            { icon: TrendingUp, title: 'Harga Bersaing', desc: 'Diskon member' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center hover:border-indigo-500/50 transition-colors"
            >
              <Icon size={24} className="text-indigo-400 mx-auto mb-2" />
              <h3 className="text-white text-sm font-semibold">{title}</h3>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Kategori</h2>
          {catLoading ? (
            <Loading text="Memuat kategori..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center hover:border-indigo-500/50 hover:bg-gray-800 transition-all group"
                >
                  <div className="text-3xl mb-2">{cat.icon || '🎮'}</div>
                  <p className="text-white text-sm font-medium group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {searchQuery ? `Hasil pencarian: "${searchQuery}"` : 'Game Populer'}
            </h2>
            <Link
              href="/products"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              Lihat Semua →
            </Link>
          </div>

          {prodLoading ? (
            <Loading text="Memuat produk..." />
          ) : !products?.length ? (
            <ErrorState message="Tidak ada produk ditemukan." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.slice(0, 10).map((product) => (
                <ElectricBorder key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="block p-4 group"
                  >
                    <div className="aspect-square rounded-lg bg-gray-800 mb-3 overflow-hidden flex items-center justify-center">
                      {product.image_url ? (
                        <picture>
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </picture>
                      ) : (
                        <span className="text-4xl">🎮</span>
                      )}
                    </div>
                    <h3 className="text-white text-sm font-medium truncate group-hover:text-indigo-400 transition-colors">
                      {product.product_name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">{product.brand}</p>
                    {product.base_price && (
                      <p className="text-indigo-400 text-sm font-semibold mt-1">
                        {formatCurrency(product.base_price)}
                      </p>
                    )}
                  </Link>
                </ElectricBorder>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
