<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplaintTicket;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $stats = Cache::remember('admin_dashboard_stats', 300, function () {
            $today = now()->startOfDay();
            $weekStart = now()->startOfWeek();
            $monthStart = now()->startOfMonth();

            return [
                'orders_today' => Order::where('created_at', '>=', $today)->count(),
                'orders_week' => Order::where('created_at', '>=', $weekStart)->count(),
                'orders_month' => Order::where('created_at', '>=', $monthStart)->count(),
                'revenue_today' => (float) Order::where('status', 'success')
                    ->where('created_at', '>=', $today)->sum('sell_price'),
                'revenue_month' => (float) Order::where('status', 'success')
                    ->where('created_at', '>=', $monthStart)->sum('sell_price'),
                'success_rate' => $this->getSuccessRate(),
                'pending_count' => Order::whereIn('status', ['pending', 'paid', 'processing'])->count(),
                'failed_count' => Order::where('status', 'failed')
                    ->where('created_at', '>=', $today)->count(),
                'total_users' => User::where('role', 'user')->count(),
                'open_tickets' => ComplaintTicket::where('status', 'open')->count(),
                'top_products' => $this->getTopProducts(),
                'payment_stats' => $this->getPaymentStats(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    private function getSuccessRate(): float
    {
        $total = Order::where('created_at', '>=', now()->startOfMonth())->count();
        if ($total === 0) return 0;
        $success = Order::where('status', 'success')
            ->where('created_at', '>=', now()->startOfMonth())->count();
        return round(($success / $total) * 100, 2);
    }

    private function getTopProducts(): array
    {
        return Order::where('status', 'success')
            ->where('created_at', '>=', now()->startOfMonth())
            ->select('product_id', DB::raw('COUNT(*) as count'))
            ->groupBy('product_id')
            ->orderByDesc('count')
            ->limit(5)
            ->with('product:id,product_name,brand')
            ->get()
            ->map(fn($o) => [
                'product_name' => $o->product?->product_name,
                'brand' => $o->product?->brand,
                'count' => $o->count,
            ])
            ->toArray();
    }

    private function getPaymentStats(): array
    {
        return Order::where('status', 'success')
            ->where('created_at', '>=', now()->startOfMonth())
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->toArray();
    }
}
