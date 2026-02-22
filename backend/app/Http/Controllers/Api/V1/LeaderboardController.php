<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\LeaderboardService;

class LeaderboardController extends Controller
{
    public function __construct(private LeaderboardService $leaderboardService) {}

    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'daily' => $this->leaderboardService->getLeaderboard('daily'),
                'weekly' => $this->leaderboardService->getLeaderboard('weekly'),
            ],
        ]);
    }
}
