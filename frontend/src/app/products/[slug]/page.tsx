'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Info, ChevronRight } from 'lucide-react';
import { useProduct, usePaymentMethods, useCheckout } from '@/hooks/useApi';
import { ElectricBorder } from '@/components/effects';
import { Button, Input, Loading, ErrorState } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: product, isLoading, error } = useProduct(slug);
  const { data: paymentMethods } = usePaymentMethods();
  const checkout = useCheckout();

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [targetId, setTargetId] = useState('');
  const [targetServer, setTargetServer] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [step, setStep] = useState(1);

  const selectedItem = product?.prices?.find((p) => p.id === selectedPrice);

  const handleCheckout = async () => {
    if (!selectedPrice || !targetId || !paymentMethod) return;

    try {
      const result = await checkout.mutateAsync({
        product_id: selectedPrice,
        target_id: targetId,
        zone_id: targetServer || undefined,
        payment_method: paymentMethod,
        phone: phone || undefined,
        email: email || undefined,
      });

      if (result.payment_url) {
        window.open(result.payment_url, '_blank');
      }
      router.push(`/order/${result.order.invoice}`);
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) return <Loading fullScreen text="Memuat detail produk..." />;
  if (error || !product) return <ErrorState message="Produk tidak ditemukan" />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="hover:text-white cursor-pointer" onClick={() => router.push('/products')}>
          Produk
        </span>
        <ChevronRight size={14} />
        <span className="text-gray-300">{product.product_name}</span>
      </div>

      {/* Product Info */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {product.image_url ? (
              <picture><img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" /></picture>
            ) : (
              <span className="text-3xl">🎮</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{product.product_name}</h1>
            <p className="text-gray-400 text-sm mt-1">{product.brand}</p>
            {product.description && (
              <p className="text-gray-500 text-sm mt-2">{product.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {s}
            </div>
            <span className={`text-sm hidden sm:inline ${step >= s ? 'text-white' : 'text-gray-500'}`}>
              {s === 1 ? 'Pilih Item' : s === 2 ? 'Data Akun' : 'Pembayaran'}
            </span>
            {s < 3 && <ChevronRight size={14} className="text-gray-600 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Item */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Pilih Nominal</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {product.prices?.map((price) => (
              <button
                key={price.id}
                onClick={() => setSelectedPrice(price.id)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedPrice === price.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <p className="text-white text-sm font-medium">{price.name}</p>
                <p className="text-indigo-400 text-sm font-bold mt-1">
                  {formatCurrency(price.sell_price)}
                </p>
              </button>
            ))}
          </div>
          <Button
            disabled={!selectedPrice}
            onClick={() => setStep(2)}
            className="w-full sm:w-auto"
          >
            Lanjutkan
          </Button>
        </div>
      )}

      {/* Step 2: Account Data */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Masukkan Data Akun</h2>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <Info size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-400">
                Pastikan ID dan Server yang kamu masukkan sudah benar. Kesalahan input bukan tanggung jawab kami.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <Input
              label="User ID / Target"
              placeholder="Masukkan User ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
            />
            <Input
              label="Server (opsional)"
              placeholder="Masukkan Server ID"
              value={targetServer}
              onChange={(e) => setTargetServer(e.target.value)}
            />
            <Input
              label="No. WhatsApp (opsional)"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Email (opsional)"
              placeholder="email@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>Kembali</Button>
            <Button disabled={!targetId} onClick={() => setStep(3)}>Lanjutkan</Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Pilih Pembayaran</h2>

          {/* Order Summary */}
          <ElectricBorder className="mb-6">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-2">Ringkasan Pesanan</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Produk</span>
                  <span className="text-white">{product.product_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Item</span>
                  <span className="text-white">{selectedItem?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target</span>
                  <span className="text-white">{targetId}{targetServer ? ` (${targetServer})` : ''}</span>
                </div>
                <hr className="border-gray-700 my-2" />
                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Total</span>
                  <span className="text-indigo-400">
                    {selectedItem ? formatCurrency(selectedItem.sell_price) : '-'}
                  </span>
                </div>
              </div>
            </div>
          </ElectricBorder>

          {/* Payment Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {paymentMethods?.map((pm) => (
              <button
                key={pm.code}
                onClick={() => setPaymentMethod(pm.code)}
                className={`p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${
                  paymentMethod === pm.code
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 text-lg">
                  💳
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{pm.name}</p>
                  <p className="text-gray-500 text-xs">{pm.group}</p>
                </div>
              </button>
            ))}
          </div>

          {checkout.error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                {(checkout.error as Error).message || 'Gagal memproses pesanan. Coba lagi.'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(2)}>Kembali</Button>
            <Button
              disabled={!paymentMethod}
              loading={checkout.isPending}
              onClick={handleCheckout}
            >
              <ShoppingCart size={16} />
              Bayar Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
