'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Receipt } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function CekTransaksiPage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoice.trim()) {
      router.push(`/order/${invoice.trim()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <Receipt size={32} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Cek Transaksi</h1>
        <p className="text-gray-400 text-sm">
          Masukkan nomor invoice untuk melihat status transaksimu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Contoh: INV-20250101-XXXXX"
          value={invoice}
          onChange={(e) => setInvoice(e.target.value)}
          className="text-center"
        />
        <Button type="submit" disabled={!invoice.trim()} className="w-full">
          <Search size={16} />
          Cek Status
        </Button>
      </form>
    </div>
  );
}
