<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaderboardSnapshot extends Model
{
    protected $fillable = [
        'period', 'user_display', 'user_id',
        'total_transactions', 'total_amount', 'snapshot_date',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'snapshot_date' => 'date',
    ];
}
