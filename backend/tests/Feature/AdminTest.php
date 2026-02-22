<?php

use App\Models\User;
use App\Models\Order;
use App\Models\ProductCategory;
use App\Models\Product;
use App\Models\ProductPrice;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->user = User::factory()->create(['role' => 'user']);

    $category = ProductCategory::create([
        'name' => 'Test Cat',
        'slug' => 'test-cat',
        'icon' => '🎮',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'product_name' => 'Test Product',
        'slug' => 'test-product',
        'brand' => 'Test Brand',
        'buyer_sku_code' => 'TST001',
        'base_price' => 10000,
        'is_active' => true,
    ]);

    $this->product = $product;
});

test('admin can access dashboard', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/dashboard/stats');

    $response->assertStatus(200);
});

test('regular user cannot access admin dashboard', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/admin/dashboard/stats');

    $response->assertStatus(403);
});

test('unauthenticated user cannot access admin', function () {
    $response = $this->getJson('/api/v1/admin/dashboard/stats');

    $response->assertStatus(401);
});

test('admin can list orders', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/orders');

    $response->assertStatus(200);
});

test('admin can list products', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/products');

    $response->assertStatus(200);
});

test('admin can list users', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/users');

    $response->assertStatus(200);
});

test('admin can view settings', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/settings/site');

    $response->assertStatus(200);
});

test('admin can update settings', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson('/api/v1/admin/settings/site', [
            'settings' => [
                ['key' => 'site_name', 'value' => 'Updated TamsHub'],
            ],
        ]);

    $response->assertStatus(200);
});

test('regular user cannot update settings', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->putJson('/api/v1/admin/settings/site', [
            'settings' => [
                ['key' => 'site_name', 'value' => 'Hacked'],
            ],
        ]);

    $response->assertStatus(403);
});
