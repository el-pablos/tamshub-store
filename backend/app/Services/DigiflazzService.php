<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DigiflazzService
{
    private string $username;
    private string $apiKey;

    public function __construct()
    {
        $this->username = config('services.digiflazz.username', '');
        $this->apiKey = config('services.digiflazz.api_key', '');
    }

    private function sign(string $refId): string
    {
        return md5($this->username . $this->apiKey . $refId);
    }

    public function getPriceList(string $type = 'prepaid'): array
    {
        try {
            $refId = 'pl-' . time();
            $response = Http::post('https://api.digiflazz.com/v1/price-list', [
                'cmd' => $type === 'prepaid' ? 'prepaid' : 'pasca',
                'username' => $this->username,
                'sign' => $this->sign($refId),
            ]);

            if ($response->successful()) {
                return $response->json('data', []);
            }

            Log::error('Digiflazz pricelist error', ['response' => $response->body()]);
            return [];
        } catch (\Exception $e) {
            Log::error('Digiflazz pricelist exception', ['error' => $e->getMessage()]);
            return [];
        }
    }

    public function createTransaction(Order $order): array
    {
        try {
            $refId = $order->invoice;
            $product = $order->product;

            $payload = [
                'username' => $this->username,
                'buyer_sku_code' => $product->buyer_sku_code,
                'customer_no' => $order->target_id,
                'ref_id' => $refId,
                'sign' => $this->sign($refId),
            ];

            Log::info('Digiflazz create transaction', ['payload' => $payload]);

            $response = Http::post('https://api.digiflazz.com/v1/transaction', $payload);
            $data = $response->json('data', []);

            Log::info('Digiflazz transaction response', ['data' => $data]);

            return $data;
        } catch (\Exception $e) {
            Log::error('Digiflazz transaction exception', ['error' => $e->getMessage()]);
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function checkStatus(string $refId, string $buyerSkuCode): array
    {
        try {
            $payload = [
                'username' => $this->username,
                'buyer_sku_code' => $buyerSkuCode,
                'ref_id' => $refId,
                'sign' => $this->sign($refId),
                'cmd' => 'status',
            ];

            $response = Http::post('https://api.digiflazz.com/v1/transaction', $payload);
            return $response->json('data', []);
        } catch (\Exception $e) {
            Log::error('Digiflazz check status exception', ['error' => $e->getMessage()]);
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    public function syncProducts(): int
    {
        $priceList = $this->getPriceList('prepaid');
        $synced = 0;

        foreach ($priceList as $item) {
            try {
                $category = \App\Models\ProductCategory::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($item['category'] ?? 'other')],
                    [
                        'name' => $item['category'] ?? 'Other',
                        'type' => $this->mapCategoryType($item['category'] ?? ''),
                    ]
                );

                Product::updateOrCreate(
                    ['buyer_sku_code' => $item['buyer_sku_code']],
                    [
                        'category_id' => $category->id,
                        'product_name' => $item['product_name'] ?? $item['buyer_sku_code'],
                        'slug' => \Illuminate\Support\Str::slug($item['buyer_sku_code']),
                        'brand' => $item['brand'] ?? null,
                        'seller_name' => $item['seller_name'] ?? null,
                        'base_price' => $item['price'] ?? 0,
                        'description' => $item['desc'] ?? null,
                        'type' => 'prepaid',
                        'is_active' => ($item['buyer_product_status'] ?? false) && ($item['seller_product_status'] ?? false),
                    ]
                );

                $synced++;
            } catch (\Exception $e) {
                Log::warning('Digiflazz sync product failed', [
                    'sku' => $item['buyer_sku_code'] ?? 'unknown',
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Cache::forget('products_list');
        Cache::forget('categories_list');

        AuditLog::log('sync_products', 'Product', null, [
            'new_values' => ['synced_count' => $synced],
        ]);

        return $synced;
    }

    private function mapCategoryType(string $category): string
    {
        $lower = strtolower($category);
        if (str_contains($lower, 'game')) return 'game';
        if (str_contains($lower, 'pulsa')) return 'pulsa';
        if (str_contains($lower, 'data')) return 'data';
        if (str_contains($lower, 'pln') || str_contains($lower, 'listrik')) return 'pln';
        if (str_contains($lower, 'wallet') || str_contains($lower, 'emoney')) return 'ewallet';
        if (str_contains($lower, 'voucher')) return 'voucher';
        return 'other';
    }
}
