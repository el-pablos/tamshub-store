<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentCallback;
use App\Services\DuitkuService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CallbackController extends Controller
{
    public function __construct(
        private DuitkuService $duitkuService,
        private OrderService $orderService,
    ) {}

    public function duitku(Request $request)
    {
        $data = $request->all();

        Log::info('Duitku callback received', ['data' => $data]);

        // Validate signature
        if (!$this->duitkuService->validateCallback($data)) {
            Log::warning('Duitku callback invalid signature', ['data' => $data]);
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $merchantOrderId = $data['merchantOrderId'] ?? '';
        $resultCode = $data['resultCode'] ?? '';

        $order = Order::where('invoice', $merchantOrderId)->first();

        // Log callback
        PaymentCallback::create([
            'order_id' => $order?->id,
            'merchant_code' => $data['merchantCode'] ?? null,
            'reference' => $data['reference'] ?? null,
            'payment_code' => $data['paymentCode'] ?? null,
            'amount' => $data['amount'] ?? null,
            'status_code' => $resultCode,
            'status_message' => $data['resultMessage'] ?? null,
            'raw_payload' => $data,
        ]);

        if (!$order) {
            Log::error('Duitku callback: order not found', ['invoice' => $merchantOrderId]);
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Process based on result code
        if ($resultCode === '00' || $resultCode === 'success') {
            $this->orderService->handlePaymentSuccess($order);
        } elseif ($resultCode === '01' || $resultCode === 'pending') {
            // masih pending, do nothing
        } else {
            $this->orderService->handlePaymentFailed($order);
        }

        return response()->json(['message' => 'OK']);
    }
}
