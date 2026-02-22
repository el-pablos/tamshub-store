<?php

namespace App\Console\Commands;

use App\Jobs\RetryCheckStatus;
use App\Models\Order;
use Illuminate\Console\Command;

class RetryPendingOrders extends Command
{
    protected $signature = 'orders:retry-pending';
    protected $description = 'Retry cek status order yang masih pending di provider';

    public function handle(): int
    {
        $orders = Order::where('status', 'processing')
            ->where('provider_status', 'pending')
            ->where('updated_at', '<=', now()->subMinutes(5))
            ->limit(50)
            ->get();

        $this->info("Menemukan {$orders->count()} order pending untuk di-retry.");

        foreach ($orders as $order) {
            RetryCheckStatus::dispatch($order)->onQueue('topup');
        }

        return Command::SUCCESS;
    }
}
