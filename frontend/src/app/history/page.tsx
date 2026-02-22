'use client';

import { useOrderHistory } from '@/hooks/useApi';
import { Loading, ErrorState, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: orders, isLoading, error, refetch } = useOrderHistory();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Riwayat Transaksi</h1>

      {isLoading ? (
        <Loading text="Memuat riwayat..." />
      ) : error ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !orders?.length ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada transaksi.</p>
          <Link href="/products" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
            Mulai belanja →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.invoice_number}`}
              className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{order.product_name}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{order.invoice_number}</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-400 text-xs">Target: {order.target_id}</span>
                <span className="text-indigo-400 font-semibold text-sm">{formatCurrency(order.total_price)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
