'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useProducts, useCategories } from '@/hooks/useApi';
import { ElectricBorder } from '@/components/effects';
import { Loading, ErrorState } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useCategories();
  const { data: products, isLoading, error, refetch } = useProducts({
    search: search || undefined,
    category: selectedCategory || undefined,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Semua Produk</h1>
        <p className="text-gray-400">Pilih game atau layanan digital yang kamu butuhkan</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
        >
          <Filter size={16} />
          <span className="hidden sm:inline text-sm">Filter</span>
        </button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <Loading text="Memuat produk..." />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !products?.length ? (
        <ErrorState message="Tidak ada produk ditemukan untuk pencarian ini." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ElectricBorder key={product.id}>
              <Link href={`/products/${product.slug}`} className="block p-4 group">
                <div className="aspect-square rounded-lg bg-gray-800 mb-3 overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-4xl">🎮</span>
                  )}
                </div>
                <h3 className="text-white text-sm font-medium truncate group-hover:text-indigo-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1">{product.brand}</p>
                {product.base_price && (
                  <p className="text-indigo-400 text-sm font-semibold mt-2">
                    {formatCurrency(product.base_price)}
                  </p>
                )}
              </Link>
            </ElectricBorder>
          ))}
        </div>
      )}
    </div>
  );
}
