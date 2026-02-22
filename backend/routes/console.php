<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduler — TamsHub Store
Schedule::command('digiflazz:sync')->dailyAt('03:00');
Schedule::command('orders:retry-pending')->everyFiveMinutes();
Schedule::command('leaderboard:refresh')->everyFifteenMinutes();
