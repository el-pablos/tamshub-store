<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'code', 'name', 'group', 'image_url',
        'fee_flat', 'fee_percent', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'fee_flat' => 'decimal:2',
        'fee_percent' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
