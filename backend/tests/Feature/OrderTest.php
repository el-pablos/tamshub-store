<?php

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;
use App\Models\PaymentMethod;

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

    PaymentMethod::create([
        'name' => 'QRIS',
        'code' => 'SP',
        'type' => 'e-wallet',
        'fee_flat' => 0,
        'fee_percent' => 0.7,
        'is_active' => true,
    ]);

    $this->product = $product;
});

test('checkout requires valid data', function () {
    $response = $this->postJson('/api/v1/orders/checkout', []);

    $response->assertStatus(422);
});

test('checkout requires product_id', function () {
    $response = $this->postJson('/api/v1/orders/checkout', [
        'target_id' => '123456',
        'payment_method_code' => 'SP',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['product_id']);
});

test('checkout requires target_id', function () {
    $response = $this->postJson('/api/v1/orders/checkout', [
        'product_id' => $this->product->id,
        'payment_method_code' => 'SP',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['target_id']);
});

test('checkout requires payment_method', function () {
    $response = $this->postJson('/api/v1/orders/checkout', [
        'product_id' => $this->product->id,
        'target_id' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['payment_method']);
});

test('can check order status', function () {
    $order = Order::create([
        'invoice' => 'INV-TEST-001',
        'product_id' => $this->product->id,
        'target_id' => '123456',
        'base_price' => 15000,
        'sell_price' => 18000,
        'total_amount' => 18000,
        'payment_method' => 'QRIS',
        'payment_channel' => 'SP',
        'status' => 'pending',
    ]);

    $response = $this->getJson("/api/v1/orders/INV-TEST-001/status");

    $response->assertStatus(200);
});

test('can list payment methods', function () {
    $response = $this->getJson('/api/v1/payment/methods');

    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('authenticated user can view order history', function () {
    $user = User::factory()->create();

    Order::create([
        'user_id' => $user->id,
        'invoice' => 'INV-HIST-001',
        'product_id' => $this->product->id,
        'target_id' => '123456',
        'base_price' => 10000,
        'sell_price' => 12000,
        'total_amount' => 12000,
        'payment_method' => 'QRIS',
        'payment_channel' => 'SP',
        'status' => 'success',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/orders/history');

    $response->assertStatus(200);
});
