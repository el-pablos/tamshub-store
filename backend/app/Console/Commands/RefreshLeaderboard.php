<?php

namespace App\Console\Commands;

use App\Services\LeaderboardService;
use Illuminate\Console\Command;

class RefreshLeaderboard extends Command
{
    protected $signature = 'leaderboard:refresh';
    protected $description = 'Refresh cache leaderboard pembelian';

    public function handle(LeaderboardService $leaderboard): int
    {
        $leaderboard->refreshLeaderboard();
        $this->info('Leaderboard berhasil di-refresh.');
        return Command::SUCCESS;
    }
}
