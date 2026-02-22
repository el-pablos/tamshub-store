'use client';

import { useState } from 'react';
import { Search, RefreshCw, Power } from 'lucide-react';
import { useAdminProducts, useSyncProducts, useToggleProduct } from '@/hooks/useAdminApi';
import { Loading, ErrorState, Button } from '@/components/ui';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useAdminProducts({ search: search || undefined, page });
  const syncProducts = useSyncProducts();
  const toggleProduct = useToggleProduct();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Produk</h1>
        <Button
          size="sm"
          onClick={() => syncProducts.mutate()}
          loading={syncProducts.isPending}
        >
          <RefreshCw size={14} />
          Sync Digiflazz
        </Button>
      </div>

      {syncProducts.isSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm">
            Sinkronisasi berhasil! {syncProducts.data?.synced} produk diperbarui.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-700">
                  <th className="text-left p-4">Nama</th>
                  <th className="text-left p-4">Brand</th>
                  <th className="text-left p-4">Kategori</th>
                  <th className="text-left p-4">Harga</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.data?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-800/50">
                    <td className="p-4 text-white">{product.name}</td>
                    <td className="p-4 text-gray-400">{product.brand}</td>
                    <td className="p-4 text-gray-400">{product.category_name}</td>
                    <td className="p-4 text-gray-400 text-xs">{product.prices_count} varian</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium ${product.is_active ? 'text-green-400' : 'text-red-400'}`}>
                        {product.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant={product.is_active ? 'danger' : 'secondary'}
                        onClick={() => toggleProduct.mutate(product.id)}
                      >
                        <Power size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Tidak ada produk. Klik &quot;Sync Digiflazz&quot; untuk mengambil data produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data?.meta && data.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium ${
                    page === p ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
