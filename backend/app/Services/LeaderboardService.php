<?php

namespace App\Services;

use App\Models\LeaderboardSnapshot;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LeaderboardService
{
    public function getLeaderboard(string $period = 'daily'): array
    {
        $cacheKey = "leaderboard_{$period}";

        return Cache::remember($cacheKey, 300, function () use ($period) {
            $dateFrom = match ($period) {
                'daily' => now()->startOfDay(),
                'weekly' => now()->startOfWeek(),
                'monthly' => now()->startOfMonth(),
                default => now()->startOfDay(),
            };

            return Order::where('status', 'success')
                ->where('created_at', '>=', $dateFrom)
                ->select(
                    'user_id',
                    DB::raw('COUNT(*) as total_transactions'),
                    DB::raw('SUM(total_amount) as total_amount')
                )
                ->groupBy('user_id')
                ->orderByDesc('total_transactions')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    $user = User::find($item->user_id);
                    return [
                        'user_display' => $user ? $user->censoredName() : 'Anon***',
                        'member_level' => $user->member_level ?? 'guest',
                        'total_transactions' => $item->total_transactions,
                        'total_amount' => (float) $item->total_amount,
                    ];
                })
                ->toArray();
        });
    }

    public function refreshLeaderboard(): void
    {
        foreach (['daily', 'weekly', 'monthly'] as $period) {
            Cache::forget("leaderboard_{$period}");
            $this->getLeaderboard($period);
        }
    }
}
