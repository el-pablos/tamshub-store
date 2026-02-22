<?php

namespace App\Services;

use App\Models\Product;

class PricingService
{
    public function calculatePrice(Product $product, string $memberLevel = 'guest'): float
    {
        return $product->getPriceForLevel($memberLevel);
    }

    public function calculatePricePreview(Product $product): array
    {
        $levels = ['guest', 'bronze', 'silver', 'gold', 'reseller'];
        $result = [];

        foreach ($levels as $level) {
            $result[$level] = $product->getPriceForLevel($level);
        }

        return $result;
    }
}
