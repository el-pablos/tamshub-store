'use client';

import { useState } from 'react';
import { Search, CheckCircle, RotateCw } from 'lucide-react';
import { useAdminOrders, useApproveOrder, useRetryOrder } from '@/hooks/useAdminApi';
import { Loading, ErrorState, StatusBadge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useAdminOrders({
    search: search || undefined,
    status: status || undefined,
    page,
  });

  const approveOrder = useApproveOrder();
  const retryOrder = useRetryOrder();

  const statuses = ['', 'pending', 'processing', 'success', 'failed', 'expired'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manajemen Pesanan</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Cari invoice atau produk..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                status === s ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>
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
                  <th className="text-left p-4">Invoice</th>
                  <th className="text-left p-4">Produk</th>
                  <th className="text-left p-4">Target</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Waktu</th>
                  <th className="text-left p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.data?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-800/50">
                    <td className="p-4 text-white font-mono text-xs">{order.invoice_number}</td>
                    <td className="p-4 text-gray-300">{order.product_name}</td>
                    <td className="p-4 text-gray-400 text-xs">{order.target_id}</td>
                    <td className="p-4 text-indigo-400 font-medium">{formatCurrency(order.total_price)}</td>
                    <td className="p-4"><StatusBadge status={order.status} /></td>
                    <td className="p-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => approveOrder.mutate(order.id)}
                            loading={approveOrder.isPending}
                          >
                            <CheckCircle size={12} />
                          </Button>
                        )}
                        {order.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => retryOrder.mutate(order.id)}
                            loading={retryOrder.isPending}
                          >
                            <RotateCw size={12} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">Tidak ada pesanan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
