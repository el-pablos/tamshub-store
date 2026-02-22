'use client';

import { ShoppingCart, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/useAdminApi';
import { Loading, ErrorState, StatusBadge } from '@/components/ui';
import { CountUp } from '@/components/effects';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, error, refetch } = useAdminDashboard();

  if (isLoading) return <Loading text="Memuat dashboard..." />;
  if (error) return <ErrorState onRetry={() => refetch()} />;
  if (!dashboard) return null;

  const stats = [
    {
      icon: ShoppingCart, label: 'Total Pesanan',
      value: dashboard.total_orders, color: 'text-blue-400', bg: 'bg-blue-500/10',
    },
    {
      icon: DollarSign, label: 'Total Pendapatan',
      value: dashboard.total_revenue, color: 'text-green-400', bg: 'bg-green-500/10',
      isCurrency: true,
    },
    {
      icon: Clock, label: 'Menunggu',
      value: dashboard.pending_orders, color: 'text-yellow-400', bg: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp, label: 'Hari Ini',
      value: dashboard.today_orders, color: 'text-indigo-400', bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg, isCurrency }) => (
          <div key={label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-gray-500 text-xs mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>
              {isCurrency ? formatCurrency(value) : <CountUp end={value} />}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Pesanan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase">
                <th className="text-left p-4">Invoice</th>
                <th className="text-left p-4">Produk</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {dashboard.recent_orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-800/50">
                  <td className="p-4 text-white font-mono text-xs">{order.invoice}</td>
                  <td className="p-4 text-gray-300">{order.product_name}</td>
                  <td className="p-4 text-indigo-400 font-medium">{formatCurrency(order.total_amount)}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4 text-gray-500 text-xs">{formatDate(order.created_at)}</td>
                </tr>
              ))}
              {!dashboard.recent_orders?.length && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada pesanan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
