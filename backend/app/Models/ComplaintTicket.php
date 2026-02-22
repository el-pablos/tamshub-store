<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ComplaintTicket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id', 'user_id', 'subject',
        'description', 'status', 'admin_notes',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(ComplaintMessage::class, 'ticket_id');
    }
}
