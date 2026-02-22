<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductPrice;
use App\Models\ProductCategory;
use App\Models\Order;
use App\Models\ComplaintTicket;
use App\Models\LeaderboardSnapshot;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $cats = ProductCategory::all()->keyBy('slug');

        // Only create products if none exist
        if (Product::count() === 0) {
            ['category_id' => $cats['mobile-legends']->id, 'buyer_sku_code' => 'ML-86', 'product_name' => 'Mobile Legends 86 Diamonds', 'slug' => 'ml-86-diamonds', 'brand' => 'Mobile Legends', 'seller_name' => 'DigiFlazz', 'base_price' => 21000, 'description' => '86 Diamonds Mobile Legends Bang Bang', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 1],
            ['category_id' => $cats['mobile-legends']->id, 'buyer_sku_code' => 'ML-172', 'product_name' => 'Mobile Legends 172 Diamonds', 'slug' => 'ml-172-diamonds', 'brand' => 'Mobile Legends', 'seller_name' => 'DigiFlazz', 'base_price' => 41000, 'description' => '172 Diamonds Mobile Legends', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 2],
            ['category_id' => $cats['mobile-legends']->id, 'buyer_sku_code' => 'ML-344', 'product_name' => 'Mobile Legends 344 Diamonds', 'slug' => 'ml-344-diamonds', 'brand' => 'Mobile Legends', 'seller_name' => 'DigiFlazz', 'base_price' => 82000, 'description' => '344 Diamonds', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 3],
            ['category_id' => $cats['free-fire']->id, 'buyer_sku_code' => 'FF-70', 'product_name' => 'Free Fire 70 Diamonds', 'slug' => 'ff-70-diamonds', 'brand' => 'Free Fire', 'seller_name' => 'DigiFlazz', 'base_price' => 10000, 'description' => '70 Diamonds Free Fire', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 1],
            ['category_id' => $cats['free-fire']->id, 'buyer_sku_code' => 'FF-140', 'product_name' => 'Free Fire 140 Diamonds', 'slug' => 'ff-140-diamonds', 'brand' => 'Free Fire', 'seller_name' => 'DigiFlazz', 'base_price' => 20000, 'description' => '140 Diamonds Free Fire', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 2],
            ['category_id' => $cats['genshin-impact']->id, 'buyer_sku_code' => 'GI-60', 'product_name' => 'Genshin Impact 60 Genesis', 'slug' => 'genshin-60-genesis', 'brand' => 'Genshin Impact', 'seller_name' => 'DigiFlazz', 'base_price' => 15000, 'description' => '60 Genesis Crystal Genshin Impact', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 1],
            ['category_id' => $cats['genshin-impact']->id, 'buyer_sku_code' => 'GI-330', 'product_name' => 'Genshin Impact 330 Genesis', 'slug' => 'genshin-330-genesis', 'brand' => 'Genshin Impact', 'seller_name' => 'DigiFlazz', 'base_price' => 69000, 'description' => '330+30 Genesis Crystal', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 2],
            ['category_id' => $cats['valorant']->id, 'buyer_sku_code' => 'VL-125', 'product_name' => 'Valorant 125 VP', 'slug' => 'valorant-125-vp', 'brand' => 'Valorant', 'seller_name' => 'DigiFlazz', 'base_price' => 14000, 'description' => '125 Valorant Points', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 1],
            ['category_id' => $cats['pubg-mobile']->id, 'buyer_sku_code' => 'PUBG-60', 'product_name' => 'PUBG Mobile 60 UC', 'slug' => 'pubg-60-uc', 'brand' => 'PUBG Mobile', 'seller_name' => 'DigiFlazz', 'base_price' => 15000, 'description' => '60 UC PUBG Mobile', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 1],
            ['category_id' => $cats['pulsa']->id, 'buyer_sku_code' => 'TSEL-10K', 'product_name' => 'Pulsa Telkomsel 10.000', 'slug' => 'pulsa-tsel-10k', 'brand' => 'Telkomsel', 'seller_name' => 'DigiFlazz', 'base_price' => 11500, 'description' => 'Pulsa Telkomsel 10rb', 'type' => 'prepaid', 'is_active' => true, 'sort_order' => 1],
        ];

        foreach ($products as $p) {
            $product = Product::create($p);
            // Create product prices for each
            ProductPrice::create([
                'product_id' => $product->id,
                'member_level' => 'guest',
                'margin_percent' => 10,
            ]);
            ProductPrice::create([
                'product_id' => $product->id,
                'member_level' => 'bronze',
                'margin_percent' => 8,
            ]);
            ProductPrice::create([
                'product_id' => $product->id,
                'member_level' => 'silver',
                'margin_percent' => 6,
            ]);
        }

        // Create some test orders
        $product1 = Product::where('slug', 'ml-86-diamonds')->first();
        $product2 = Product::where('slug', 'ff-70-diamonds')->first();
        $product3 = Product::where('slug', 'genshin-60-genesis')->first();

        $orders = [
            [
                'invoice' => 'INV-20260222-00001',
                'user_id' => 2,
                'product_id' => $product1->id,
                'customer_name' => 'User Demo',
                'customer_email' => 'user@tamshub.store',
                'customer_phone' => '081234567890',
                'target_id' => '12345678',
                'zone_id' => '9999',
                'base_price' => 21000,
                'sell_price' => 23100,
                'payment_fee' => 3000,
                'total_amount' => 26100,
                'status' => 'success',
                'system_mode' => 'autopilot',
                'payment_method' => 'BC',
                'payment_channel' => 'BCA Virtual Account',
                'paid_at' => now(),
                'provider_ref' => 'DG-TEST-001',
                'provider_sn' => 'SN-TEST-0001',
                'provider_status' => 'Sukses',
                'provider_completed_at' => now(),
            ],
            [
                'invoice' => 'INV-20260222-00002',
                'user_id' => 2,
                'product_id' => $product2->id,
                'customer_name' => 'User Demo',
                'customer_email' => 'user@tamshub.store',
                'customer_phone' => '081234567890',
                'target_id' => '87654321',
                'base_price' => 10000,
                'sell_price' => 11000,
                'payment_fee' => 3000,
                'total_amount' => 14000,
                'status' => 'pending',
                'system_mode' => 'autopilot',
                'payment_method' => 'QR',
                'payment_channel' => 'QRIS',
                'payment_url' => 'https://sandbox.duitku.com/test',
                'expired_at' => now()->addHours(24),
            ],
            [
                'invoice' => 'INV-20260222-00003',
                'user_id' => 2,
                'product_id' => $product3->id,
                'customer_name' => 'User Demo',
                'customer_email' => 'user@tamshub.store',
                'customer_phone' => '081234567890',
                'target_id' => '900100200',
                'zone_id' => 'Asia',
                'base_price' => 15000,
                'sell_price' => 16500,
                'payment_fee' => 3000,
                'total_amount' => 19500,
                'status' => 'failed',
                'system_mode' => 'autopilot',
                'payment_method' => 'DA',
                'payment_channel' => 'DANA',
                'paid_at' => now()->subHour(),
                'provider_ref' => 'DG-TEST-FAIL',
                'provider_status' => 'Gagal',
            ],
        ];

        foreach ($orders as $o) {
            Order::create($o);
        }

        // Create a complaint ticket for the failed order
        ComplaintTicket::create([
            'order_id' => Order::where('invoice', 'INV-20260222-00003')->first()->id,
            'user_id' => 2,
            'subject' => 'Order gagal tapi saldo terpotong',
            'description' => 'Halo admin, saya sudah bayar tapi status transaksi gagal. Mohon dicek ya. Terima kasih.',
            'status' => 'open',
        ]);

        // Create leaderboard data
        LeaderboardSnapshot::create([
            'user_id' => 2,
            'period' => 'monthly',
            'total_amount' => 59600,
            'total_transactions' => 3,
            'rank' => 1,
            'snapshot_date' => now()->startOfMonth(),
        ]);
        LeaderboardSnapshot::create([
            'user_id' => 1,
            'period' => 'monthly',
            'total_amount' => 250000,
            'total_transactions' => 10,
            'rank' => 2,
            'snapshot_date' => now()->startOfMonth(),
        ]);

        echo "Test data seeded successfully!\n";
    }
}
