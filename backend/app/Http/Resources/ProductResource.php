<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $memberLevel = $request->user()?->member_level ?? 'guest';

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn() => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'type' => $this->category->type,
            ]),
            'buyer_sku_code' => $this->buyer_sku_code,
            'product_name' => $this->product_name,
            'slug' => $this->slug,
            'brand' => $this->brand,
            'price' => $this->getPriceForLevel($memberLevel),
            'base_price' => $this->when($request->user()?->isAdmin(), $this->base_price),
            'description' => $this->description,
            'type' => $this->type,
            'is_active' => $this->is_active,
            'is_promo' => $this->is_promo,
            'prices' => $this->when($this->getAttribute('sibling_prices'), fn() => $this->getAttribute('sibling_prices')),
        ];
    }
}
