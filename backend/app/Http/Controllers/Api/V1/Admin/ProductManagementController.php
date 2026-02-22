<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductPrice;
use App\Services\DigiflazzService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProductManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($search = $request->input('search')) {
            $query->where('product_name', 'like', "%{$search}%");
        }
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('sort_order')->paginate(30),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'product_name' => 'sometimes|string|max:200',
            'category_id' => 'sometimes|exists:product_categories,id',
            'is_active' => 'sometimes|boolean',
            'is_promo' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
            'description' => 'sometimes|nullable|string',
        ]);

        $old = $product->toArray();
        $product->update($validated);
        Cache::forget('products_list');

        AuditLog::log('update_product', 'Product', $id, [
            'old_values' => $old,
            'new_values' => $validated,
        ]);

        return response()->json(['success' => true, 'data' => $product->fresh()]);
    }

    public function toggleStatus(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => !$product->is_active]);
        Cache::forget('products_list');

        return response()->json([
            'success' => true,
            'data' => ['is_active' => $product->is_active],
        ]);
    }

    public function massToggle(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
            'is_active' => 'required|boolean',
        ]);

        Product::whereIn('id', $validated['ids'])->update(['is_active' => $validated['is_active']]);
        Cache::forget('products_list');

        return response()->json(['success' => true, 'message' => 'Status produk diperbarui.']);
    }

    public function syncFromProvider(DigiflazzService $digiflazz)
    {
        $count = $digiflazz->syncProducts();

        return response()->json([
            'success' => true,
            'message' => "Berhasil sinkron {$count} produk dari Digiflazz.",
        ]);
    }

    // Categories
    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => ProductCategory::withCount('products')->orderBy('sort_order')->get(),
        ]);
    }

    public function createCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:game,pulsa,data,pln,ewallet,voucher,other',
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        $category = ProductCategory::create($validated);
        Cache::forget('categories_list');

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function updateCategory(Request $request, int $id)
    {
        $category = ProductCategory::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'type' => 'sometimes|in:game,pulsa,data,pln,ewallet,voucher,other',
            'icon' => 'sometimes|nullable|string',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        $category->update($validated);
        Cache::forget('categories_list');

        return response()->json(['success' => true, 'data' => $category->fresh()]);
    }

    // Pricing
    public function pricing(int $productId)
    {
        $product = Product::with('prices')->findOrFail($productId);
        $levels = ['guest', 'bronze', 'silver', 'gold', 'reseller'];
        $result = [];

        foreach ($levels as $level) {
            $rule = $product->prices->where('member_level', $level)->first();
            $result[] = [
                'member_level' => $level,
                'margin_percent' => $rule ? (float) $rule->margin_percent : 10,
                'override_price' => $rule ? $rule->override_price : null,
                'final_price' => $product->getPriceForLevel($level),
                'base_price' => (float) $product->base_price,
            ];
        }

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function updatePricing(Request $request, int $productId)
    {
        $product = Product::findOrFail($productId);
        $validated = $request->validate([
            'prices' => 'required|array',
            'prices.*.member_level' => 'required|in:guest,bronze,silver,gold,reseller',
            'prices.*.margin_percent' => 'required|numeric|min:0|max:100',
            'prices.*.override_price' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated['prices'] as $priceData) {
            ProductPrice::updateOrCreate(
                ['product_id' => $product->id, 'member_level' => $priceData['member_level']],
                [
                    'margin_percent' => $priceData['margin_percent'],
                    'override_price' => $priceData['override_price'] ?? null,
                ]
            );
        }

        AuditLog::log('update_pricing', 'Product', $productId);

        return response()->json(['success' => true, 'message' => 'Harga diperbarui.']);
    }
}
