<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\AuditLog;
use App\Services\DigiflazzService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessTopup implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public Order $order) {}

    public function handle(DigiflazzService $digiflazz): void
    {
        if (!in_array($this->order->status, ['paid', 'processing'])) {
            Log::info('ProcessTopup skipped: order not paid', ['invoice' => $this->order->invoice]);
            return;
        }

        $this->order->update(['status' => 'processing']);

        try {
            $result = $digiflazz->createTransaction($this->order);

            $status = $result['status'] ?? 'Pending';
            $providerStatus = strtolower($status) === 'sukses' ? 'sukses' :
                              (strtolower($status) === 'gagal' ? 'gagal' : 'pending');

            $this->order->update([
                'provider_ref' => $result['ref_id'] ?? $this->order->invoice,
                'provider_sn' => $result['sn'] ?? null,
                'provider_status' => $providerStatus,
            ]);

            if ($providerStatus === 'sukses') {
                $this->order->update([
                    'status' => 'success',
                    'provider_completed_at' => now(),
                ]);
            } elseif ($providerStatus === 'gagal') {
                $this->order->update(['status' => 'failed']);
            }
            // pending => tunggu webhook

            AuditLog::log('process_topup', 'Order', $this->order->id, [
                'new_values' => ['provider_status' => $providerStatus],
            ]);
        } catch (\Exception $e) {
            Log::error('ProcessTopup failed', [
                'invoice' => $this->order->invoice,
                'error' => $e->getMessage(),
            ]);

            if ($this->attempts() >= $this->tries) {
                $this->order->update(['status' => 'failed']);
            }

            throw $e;
        }
    }
}
