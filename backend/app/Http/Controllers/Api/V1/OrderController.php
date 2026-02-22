<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\ComplaintRequest;
use App\Http\Resources\OrderResource;
use App\Models\ComplaintTicket;
use App\Models\ComplaintMessage;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function checkout(CheckoutRequest $request)
    {
        // Anti double-click lock via Redis
        $lockKey = 'checkout_lock_' . ($request->user()?->id ?? $request->ip());
        $lock = Cache::lock($lockKey, 10);

        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Mohon tunggu, order sebelumnya sedang diproses.',
            ], 429);
        }

        try {
            $memberLevel = $request->user()?->member_level ?? 'guest';
            $result = $this->orderService->checkout($request->validated(), $memberLevel);

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat.',
                'data' => [
                    'invoice' => $result['order']->invoice,
                    'payment_url' => $result['payment_url'],
                    'total_amount' => (float) $result['order']->total_amount,
                    'expired_at' => $result['order']->expired_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Checkout gagal: ' . $e->getMessage(),
            ], 500);
        } finally {
            $lock->release();
        }
    }

    public function status(string $invoice)
    {
        $order = Order::with('product')
            ->where('invoice', $invoice)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    public function history(Request $request)
    {
        $orders = Order::with('product')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return OrderResource::collection($orders);
    }

    public function complaint(ComplaintRequest $request, int $orderId)
    {
        $order = Order::where('id', $orderId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Rate limit: 3 complaint per user per hour
        $key = 'complaint_' . $request->user()->id;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak komplain. Coba lagi nanti.',
            ], 429);
        }
        RateLimiter::hit($key, 3600);

        $ticket = ComplaintTicket::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'subject' => $request->subject,
            'description' => $request->description,
            'status' => 'open',
        ]);

        ComplaintMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'sender_type' => 'user',
            'message' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tiket komplain berhasil dibuat.',
            'data' => [
                'ticket_id' => $ticket->id,
                'status' => $ticket->status,
            ],
        ], 201);
    }
}
