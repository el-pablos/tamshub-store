<?php

use App\Services\PricingService;
use App\Models\ProductPrice;
use App\Models\Product;
use App\Models\ProductCategory;

beforeEach(function () {
    $this->pricingService = new PricingService();

    $category = ProductCategory::create([
        'name' => 'Mobile Game',
        'slug' => 'mobile-game',
        'icon' => '🎮',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'product_name' => 'Mobile Legends Diamond',
        'slug' => 'mobile-legends-diamond',
        'brand' => 'Mobile Legends',
        'buyer_sku_code' => 'ML_DIAMOND',
        'base_price' => 15000,
        'is_active' => true,
    ]);

    ProductPrice::create([
        'product_id' => $product->id,
        'member_level' => 'guest',
        'margin_percent' => 10,
    ]);

    ProductPrice::create([
        'product_id' => $product->id,
        'member_level' => 'reseller',
        'margin_percent' => 5,
    ]);

    $this->product = $product;
});

test('calculatePrice returns correct price for guest level', function () {
    $result = $this->pricingService->calculatePrice($this->product, 'guest');

    // 15000 * 1.10 = 16500
    expect($result)->toBe(16500.0);
});

test('calculatePrice returns correct price for reseller level', function () {
    $result = $this->pricingService->calculatePrice($this->product, 'reseller');

    // 15000 * 1.05 = 15750
    expect($result)->toBe(15750.0);
});

test('calculatePricePreview returns array with all levels', function () {
    $result = $this->pricingService->calculatePricePreview($this->product);

    expect($result)->toBeArray()
        ->toHaveKeys(['guest', 'bronze', 'silver', 'gold', 'reseller']);
});
