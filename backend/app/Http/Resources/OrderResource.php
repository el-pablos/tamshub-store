<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice' => $this->invoice,
            'product' => $this->whenLoaded('product', fn() => [
                'id' => $this->product->id,
                'product_name' => $this->product->product_name,
                'brand' => $this->product->brand,
            ]),
            'target_id' => $this->target_id,
            'zone_id' => $this->zone_id,
            'sell_price' => (float) $this->sell_price,
            'payment_fee' => (float) $this->payment_fee,
            'total_amount' => (float) $this->total_amount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_url' => $this->payment_url,
            'provider_sn' => $this->when(
                $this->status === 'success',
                $this->provider_sn
            ),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'expired_at' => $this->expired_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'has_complaint' => $this->complaintTickets()->exists(),
        ];
    }
}
