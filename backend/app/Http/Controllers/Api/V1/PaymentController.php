<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Cache;

class PaymentController extends Controller
{
    public function methods()
    {
        $methods = Cache::remember('payment_methods_active', 3600, function () {
            return PaymentMethod::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'code', 'name', 'group', 'image_url', 'fee_flat', 'fee_percent']);
        });

        return response()->json([
            'success' => true,
            'data' => $methods,
        ]);
    }
}
