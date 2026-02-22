<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComplaintMessage extends Model
{
    protected $fillable = [
        'ticket_id', 'user_id', 'sender_type', 'message',
    ];

    public function ticket()
    {
        return $this->belongsTo(ComplaintTicket::class, 'ticket_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
