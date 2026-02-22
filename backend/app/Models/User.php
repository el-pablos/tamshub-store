<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone', 'password',
        'role', 'member_level', 'is_active',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function complaintTickets()
    {
        return $this->hasMany(ComplaintTicket::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function censoredName(): string
    {
        $name = $this->name;
        if (strlen($name) <= 3) return $name[0] . '***';
        return substr($name, 0, 3) . str_repeat('*', strlen($name) - 3);
    }
}
