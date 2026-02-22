<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id', 'buyer_sku_code', 'product_name', 'slug',
        'brand', 'seller_name', 'base_price', 'description',
        'type', 'is_active', 'is_promo', 'unlimited_stock',
        'stock', 'sort_order',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_promo' => 'boolean',
        'unlimited_stock' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function prices()
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function getPriceForLevel(string $level = 'guest'): float
    {
        $priceRule = $this->prices()->where('member_level', $level)->first();

        if ($priceRule && $priceRule->override_price !== null) {
            return (float) $priceRule->override_price;
        }

        $marginPercent = $priceRule ? (float) $priceRule->margin_percent : 10;
        return round((float) $this->base_price * (1 + $marginPercent / 100), 2);
    }
}
