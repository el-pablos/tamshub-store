<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\AuditLog;
use App\Jobs\ProcessTopup;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    public function __construct(
        private DuitkuService $duitkuService,
        private PricingService $pricingService,
    ) {}

    public function checkout(array $data, ?string $memberLevel = 'guest'): array
    {
        $product = Product::where('is_active', true)->findOrFail($data['product_id']);

        $sellPrice = $this->pricingService->calculatePrice($product, $memberLevel);
        $paymentMethod = $data['payment_method'] ?? '';
        $paymentFee = $this->estimatePaymentFee($paymentMethod, $sellPrice);
        $totalAmount = $sellPrice + $paymentFee;

        $systemMode = config('services.system_mode', 'autopilot');
        // Bisa juga per kategori, tapi default global dulu
        $categoryMode = $product->category->type ?? null;

        return DB::transaction(function () use ($data, $product, $sellPrice, $paymentFee, $totalAmount, $paymentMethod, $systemMode) {
            $order = Order::create([
                'invoice' => Order::generateInvoice(),
                'user_id' => auth()->id(),
                'product_id' => $product->id,
                'customer_name' => $data['customer_name'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'target_id' => $data['target_id'],
                'zone_id' => $data['zone_id'] ?? null,
                'base_price' => $product->base_price,
                'sell_price' => $sellPrice,
                'payment_fee' => $paymentFee,
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'system_mode' => $systemMode,
                'payment_method' => $paymentMethod,
                'expired_at' => now()->addMinutes(60),
            ]);

            // Request payment ke Duitku
            $invoiceResult = $this->duitkuService->createInvoice($order, $paymentMethod);

            if (isset($invoiceResult['paymentUrl'])) {
                $order->update([
                    'payment_url' => $invoiceResult['paymentUrl'],
                    'payment_ref' => $invoiceResult['reference'] ?? null,
                ]);
            }

            AuditLog::log('checkout', 'Order', $order->id, [
                'new_values' => [
                    'invoice' => $order->invoice,
                    'product' => $product->product_name,
                    'total' => $totalAmount,
                ],
            ]);

            return [
                'order' => $order->fresh(),
                'payment_url' => $invoiceResult['paymentUrl'] ?? null,
                'reference' => $invoiceResult['reference'] ?? null,
            ];
        });
    }

    public function handlePaymentSuccess(Order $order): void
    {
        $order->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if ($order->system_mode === 'autopilot') {
            ProcessTopup::dispatch($order)->onQueue('topup');
        }
        // Kalau manual mode, order menunggu approval admin
    }

    public function handlePaymentFailed(Order $order): void
    {
        $order->update(['status' => 'failed']);
    }

    public function handlePaymentExpired(Order $order): void
    {
        $order->update(['status' => 'expired']);
    }

    public function approveManualOrder(Order $order): void
    {
        $order->update(['admin_approved' => true]);
        ProcessTopup::dispatch($order)->onQueue('topup');
        AuditLog::log('approve_order', 'Order', $order->id);
    }

    private function estimatePaymentFee(string $method, float $amount): float
    {
        $pm = \App\Models\PaymentMethod::where('code', $method)->first();
        if (!$pm) return 0;
        return (float) $pm->fee_flat + ($amount * (float) $pm->fee_percent / 100);
    }
}
