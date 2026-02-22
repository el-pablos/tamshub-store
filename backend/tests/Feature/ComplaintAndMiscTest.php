<?php

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ComplaintTicket;

test('user can submit complaint for own order', function () {
    $user = User::factory()->create();

    $category = ProductCategory::create([
        'name' => 'Game', 'slug' => 'game', 'icon' => '🎮', 'is_active' => true, 'sort_order' => 1,
    ]);
    $product = Product::create([
        'category_id' => $category->id, 'product_name' => 'Test Product', 'slug' => 'test-product',
        'brand' => 'Test', 'buyer_sku_code' => 'TP001', 'base_price' => 10000, 'is_active' => true,
    ]);

    $order = Order::create([
        'user_id' => $user->id,
        'invoice' => 'INV-COMP-001',
        'product_id' => $product->id,
        'target_id' => '123456',
        'base_price' => 10000,
        'sell_price' => 12000,
        'total_amount' => 12000,
        'payment_method' => 'QRIS',
        'payment_channel' => 'SP',
        'status' => 'success',
    ]);

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/orders/{$order->id}/complaint", [
            'subject' => 'Diamond tidak masuk',
            'description' => 'Sudah bayar tapi diamond belum masuk ke akun saya.',
        ]);

    $response->assertStatus(201);
});

test('complaint requires subject and description', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/orders/999/complaint', []);

    $response->assertStatus(422);
});

test('guest cannot submit complaint without auth', function () {
    $response = $this->postJson('/api/v1/orders/1/complaint', [
        'subject' => 'Test',
        'description' => 'Test message',
    ]);

    $response->assertStatus(401);
});

test('can fetch leaderboard', function () {
    $response = $this->getJson('/api/v1/leaderboard');

    $response->assertStatus(200)
        ->assertJsonStructure(['data']);
});

test('can access site settings', function () {
    $response = $this->getJson('/api/v1/site/settings');

    $response->assertStatus(200);
});
