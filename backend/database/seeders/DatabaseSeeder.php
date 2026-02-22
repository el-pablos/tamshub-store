<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use App\Models\ProductCategory;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin TamsHub',
            'email' => 'admin@tamshub.store',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'member_level' => 'reseller',
            'is_active' => true,
        ]);

        // Demo user
        User::create([
            'name' => 'User Demo',
            'email' => 'user@tamshub.store',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'member_level' => 'guest',
            'is_active' => true,
        ]);

        // Default categories
        $categories = [
            ['name' => 'Mobile Legends', 'slug' => 'mobile-legends', 'type' => 'game', 'sort_order' => 1],
            ['name' => 'Free Fire', 'slug' => 'free-fire', 'type' => 'game', 'sort_order' => 2],
            ['name' => 'PUBG Mobile', 'slug' => 'pubg-mobile', 'type' => 'game', 'sort_order' => 3],
            ['name' => 'Genshin Impact', 'slug' => 'genshin-impact', 'type' => 'game', 'sort_order' => 4],
            ['name' => 'Valorant', 'slug' => 'valorant', 'type' => 'game', 'sort_order' => 5],
            ['name' => 'Pulsa', 'slug' => 'pulsa', 'type' => 'pulsa', 'sort_order' => 10],
            ['name' => 'Paket Data', 'slug' => 'paket-data', 'type' => 'data', 'sort_order' => 11],
            ['name' => 'PLN / Token Listrik', 'slug' => 'pln', 'type' => 'pln', 'sort_order' => 12],
            ['name' => 'E-Wallet', 'slug' => 'e-wallet', 'type' => 'ewallet', 'sort_order' => 13],
            ['name' => 'Voucher Game', 'slug' => 'voucher-game', 'type' => 'voucher', 'sort_order' => 14],
        ];

        foreach ($categories as $cat) {
            ProductCategory::create($cat);
        }

        // Default payment methods (Duitku channels)
        $paymentMethods = [
            ['code' => 'BC', 'name' => 'BCA Virtual Account', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 1],
            ['code' => 'M2', 'name' => 'Mandiri Virtual Account', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 2],
            ['code' => 'VA', 'name' => 'Maybank Virtual Account', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 3],
            ['code' => 'I1', 'name' => 'BNI Virtual Account', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 4],
            ['code' => 'B1', 'name' => 'CIMB Niaga Virtual Account', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 5],
            ['code' => 'BT', 'name' => 'Permata Bank Virtual Account', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 6],
            ['code' => 'SP', 'name' => 'ShopeePay', 'group' => 'E-Wallet', 'fee_percent' => 2, 'sort_order' => 10],
            ['code' => 'OV', 'name' => 'OVO', 'group' => 'E-Wallet', 'fee_percent' => 2, 'sort_order' => 11],
            ['code' => 'DA', 'name' => 'DANA', 'group' => 'E-Wallet', 'fee_percent' => 2, 'sort_order' => 12],
            ['code' => 'SA', 'name' => 'SakuKu', 'group' => 'E-Wallet', 'fee_percent' => 2, 'sort_order' => 13],
            ['code' => 'AG', 'name' => 'Bank Artha Graha', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 7],
            ['code' => 'S1', 'name' => 'Bank Sahabat Sampoerna', 'group' => 'VA', 'fee_flat' => 3000, 'sort_order' => 8],
            ['code' => 'LA', 'name' => 'LinkAja', 'group' => 'E-Wallet', 'fee_percent' => 2, 'sort_order' => 14],
            ['code' => 'A1', 'name' => 'Alfamart', 'group' => 'Retail', 'fee_flat' => 5000, 'sort_order' => 20],
            ['code' => 'FT', 'name' => 'Indomaret', 'group' => 'Retail', 'fee_flat' => 5000, 'sort_order' => 21],
            ['code' => 'QR', 'name' => 'QRIS', 'group' => 'QRIS', 'fee_percent' => 0.7, 'sort_order' => 30],
        ];

        foreach ($paymentMethods as $pm) {
            PaymentMethod::create($pm);
        }

        // Default site settings
        $settings = [
            'site_name' => 'TamsHub Store',
            'site_description' => 'Menyediakan segala kebutuhan online anda dengan harga terjangkau, proses cepat, dan layanan 24/7.',
            'hero_text' => 'Top Up Game & Online Service',
            'admin_whatsapp' => '6281234567890',
            'meta_title' => 'TamsHub Store | Top Up Game & Online Service',
            'meta_description' => 'Platform top up game dan layanan online terpercaya di Indonesia. Proses otomatis, harga murah, banyak metode pembayaran.',
            'system_mode' => 'autopilot',
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::create(['key' => $key, 'value' => $value]);
        }
    }
}
