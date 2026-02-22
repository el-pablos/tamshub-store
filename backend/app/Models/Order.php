<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice', 'user_id', 'product_id',
        'customer_name', 'customer_email', 'customer_phone',
        'target_id', 'zone_id',
        'base_price', 'sell_price', 'payment_fee', 'total_amount',
        'status', 'system_mode', 'admin_approved', 'admin_notes',
        'payment_method', 'payment_channel', 'payment_ref', 'payment_url',
        'paid_at', 'expired_at',
        'provider_ref', 'provider_sn', 'provider_status', 'provider_completed_at',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'sell_price' => 'decimal:2',
        'payment_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'admin_approved' => 'boolean',
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
        'provider_completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function paymentCallbacks()
    {
        return $this->hasMany(PaymentCallback::class);
    }

    public function webhookEvents()
    {
        return $this->hasMany(WebhookEvent::class);
    }

    public function complaintTickets()
    {
        return $this->hasMany(ComplaintTicket::class);
    }

    public static function generateInvoice(): string
    {
        return 'TH-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
    }
}
