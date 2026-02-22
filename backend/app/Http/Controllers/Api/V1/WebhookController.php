<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function digiflazz(Request $request)
    {
        $data = $request->all();

        Log::info('Digiflazz webhook received', ['data' => $data]);

        // Validate webhook secret
        $secret = config('services.digiflazz.webhook_secret');
        $headerSecret = $request->header('X-Hub-Signature', '');

        // Digiflazz webhook format: data.data contains the actual data
        $webhookData = $data['data'] ?? $data;

        $refId = $webhookData['ref_id'] ?? null;
        $status = strtolower($webhookData['status'] ?? '');
        $sn = $webhookData['sn'] ?? null;
        $buyerSkuCode = $webhookData['buyer_sku_code'] ?? null;

        $order = $refId ? Order::where('invoice', $refId)->first() : null;

        // Log webhook
        WebhookEvent::create([
            'order_id' => $order?->id,
            'provider' => 'digiflazz',
            'ref_id' => $refId,
            'status' => $status,
            'buyer_sku_code' => $buyerSkuCode,
            'sn' => $sn,
            'raw_payload' => $data,
        ]);

        if (!$order) {
            Log::warning('Digiflazz webhook: order not found', ['ref_id' => $refId]);
            return response()->json(['message' => 'OK']);
        }

        // Map Digiflazz status
        if ($status === 'sukses') {
            $order->update([
                'status' => 'success',
                'provider_status' => 'sukses',
                'provider_sn' => $sn,
                'provider_completed_at' => now(),
            ]);
        } elseif ($status === 'gagal') {
            $order->update([
                'status' => 'failed',
                'provider_status' => 'gagal',
            ]);
        } else {
            $order->update([
                'provider_status' => 'pending',
            ]);
        }

        return response()->json(['message' => 'OK']);
    }
}
