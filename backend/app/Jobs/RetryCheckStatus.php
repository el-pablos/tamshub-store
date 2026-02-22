<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\DigiflazzService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RetryCheckStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $backoff = 60;

    public function __construct(public Order $order) {}

    public function handle(DigiflazzService $digiflazz): void
    {
        if ($this->order->status === 'success' || $this->order->status === 'failed') {
            return;
        }

        $result = $digiflazz->checkStatus(
            $this->order->invoice,
            $this->order->product->buyer_sku_code
        );

        $status = strtolower($result['status'] ?? 'pending');

        if ($status === 'sukses') {
            $this->order->update([
                'status' => 'success',
                'provider_status' => 'sukses',
                'provider_sn' => $result['sn'] ?? $this->order->provider_sn,
                'provider_completed_at' => now(),
            ]);
        } elseif ($status === 'gagal') {
            $this->order->update([
                'status' => 'failed',
                'provider_status' => 'gagal',
            ]);
        } else {
            Log::info('RetryCheckStatus still pending', ['invoice' => $this->order->invoice]);
        }
    }
}
