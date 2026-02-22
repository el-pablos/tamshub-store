<?php

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;

beforeEach(function () {
    $category = ProductCategory::create([
        'name' => 'Mobile Game',
        'slug' => 'mobile-game',
        'icon' => '🎮',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'product_name' => 'Mobile Legends',
        'slug' => 'mobile-legends',
        'brand' => 'Moonton',
        'buyer_sku_code' => 'ML001',
        'base_price' => 15000,
        'is_active' => true,
    ]);

    ProductPrice::create([
        'product_id' => $product->id,
        'member_level' => 'guest',
        'margin_percent' => 10,
    ]);

    $this->product = $product;
    $this->category = $category;
});

test('can list products', function () {
    $response = $this->getJson('/api/v1/products');

    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('can show product by slug', function () {
    $response = $this->getJson('/api/v1/products/mobile-legends');

    $response->assertStatus(200);
});

test('can list categories', function () {
    $response = $this->getJson('/api/v1/categories');

    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('can filter products by category', function () {
    $response = $this->getJson('/api/v1/products?category=mobile-game');

    $response->assertStatus(200);
});

test('can search products', function () {
    $response = $this->getJson('/api/v1/products?search=mobile');

    $response->assertStatus(200);
});

test('returns 404 for nonexistent product', function () {
    $response = $this->getJson('/api/v1/products/nonexistent-game');

    $response->assertStatus(404);
});
