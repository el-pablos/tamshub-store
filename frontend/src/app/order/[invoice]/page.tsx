'use client';

import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Loader2, Copy, ExternalLink } from 'lucide-react';
import { useOrderStatus } from '@/hooks/useApi';
import { Loading, ErrorState, Button, StatusBadge } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const invoice = params.invoice as string;
  const [copied, setCopied] = useState(false);

  const { data: order, isLoading, error, refetch } = useOrderStatus(invoice);

  const copyInvoice = () => {
    navigator.clipboard.writeText(invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <Loading fullScreen text="Memuat status pesanan..." />;
  if (error || !order) return <ErrorState message="Pesanan tidak ditemukan." onRetry={() => refetch()} />;

  const statusIcon = {
    success: <CheckCircle size={48} className="text-green-400" />,
    failed: <XCircle size={48} className="text-red-400" />,
    expired: <XCircle size={48} className="text-yellow-400" />,
    pending: <Clock size={48} className="text-yellow-400" />,
    processing: <Loader2 size={48} className="text-indigo-400 animate-spin" />,
  };

  const statusMessage = {
    success: 'Transaksi Berhasil! 🎉',
    failed: 'Transaksi Gagal',
    expired: 'Transaksi Kedaluwarsa',
    pending: 'Menunggu Pembayaran',
    processing: 'Sedang Diproses',
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Status Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {statusIcon[order.status as keyof typeof statusIcon] || <Clock size={48} className="text-gray-400" />}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {statusMessage[order.status as keyof typeof statusMessage] || order.status}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Order Details Card */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Invoice</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-xs">{order.invoice}</span>
              <button onClick={copyInvoice} className="text-gray-500 hover:text-white transition-colors">
                <Copy size={14} />
              </button>
              {copied && <span className="text-green-400 text-xs">Copied!</span>}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Produk</span>
            <span className="text-white">{order.product?.product_name ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Target</span>
            <span className="text-white">{order.target_id}{order.zone_id ? ` (${order.zone_id})` : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pembayaran</span>
            <span className="text-white">{order.payment_method}</span>
          </div>
          <hr className="border-gray-700" />
          <div className="flex justify-between font-bold">
            <span className="text-gray-300">Total</span>
            <span className="text-indigo-400">{formatCurrency(order.total_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Waktu</span>
            <span className="text-gray-300 text-xs">{formatDate(order.created_at)}</span>
          </div>
          {order.provider_sn && (
            <div className="flex justify-between">
              <span className="text-gray-400">SN / Ref</span>
              <span className="text-green-400 font-mono text-xs">{order.provider_sn}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment URL (if pending) */}
      {order.status === 'pending' && order.payment_url && (
        <a
          href={order.payment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-6 font-medium transition-colors w-full mb-4"
        >
          <ExternalLink size={16} />
          Bayar Sekarang
        </a>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => router.push('/')}>
          Kembali ke Beranda
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => router.push('/cek-transaksi')}>
          Cek Transaksi Lain
        </Button>
      </div>
    </div>
  );
}
