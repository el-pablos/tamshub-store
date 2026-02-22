<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\AuditLog;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderManagementController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request)
    {
        $query = Order::with('product', 'user');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }
        if ($dateFrom = $request->input('date_from')) {
            $query->where('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->where('created_at', '<=', $dateTo . ' 23:59:59');
        }
        if ($userId = $request->input('user_id')) {
            $query->where('user_id', $userId);
        }
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice', 'like', "%{$search}%")
                  ->orWhere('target_id', 'like', "%{$search}%")
                  ->orWhere('payment_ref', 'like', "%{$search}%");
            });
        }

        $orders = $query->orderByDesc('created_at')->paginate(20);
        return OrderResource::collection($orders);
    }

    public function show(int $id)
    {
        $order = Order::with(['product', 'user', 'paymentCallbacks', 'webhookEvents', 'complaintTickets'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => new OrderResource($order),
                'callbacks' => $order->paymentCallbacks,
                'webhooks' => $order->webhookEvents,
                'tickets' => $order->complaintTickets,
            ],
        ]);
    }

    public function approve(int $id)
    {
        $order = Order::where('status', 'paid')
            ->where('system_mode', 'manual')
            ->findOrFail($id);

        $this->orderService->approveManualOrder($order);

        return response()->json([
            'success' => true,
            'message' => 'Order disetujui dan diproses.',
        ]);
    }

    public function manualQueue(Request $request)
    {
        $orders = Order::with('product', 'user')
            ->where('status', 'paid')
            ->where('system_mode', 'manual')
            ->where('admin_approved', false)
            ->orderBy('created_at')
            ->paginate(20);

        return OrderResource::collection($orders);
    }

    public function retry(int $id)
    {
        $order = Order::findOrFail($id);
        \App\Jobs\RetryCheckStatus::dispatch($order);

        return response()->json([
            'success' => true,
            'message' => 'Retry check status dijadwalkan.',
        ]);
    }
}
