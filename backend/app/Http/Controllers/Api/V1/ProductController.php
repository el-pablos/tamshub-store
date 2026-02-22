<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')
            ->where('is_active', true);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('buyer_sku_code', 'like', "%{$search}%");
            });
        }

        // Filter category
        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Filter brand
        if ($brand = $request->input('brand')) {
            $query->where('brand', $brand);
        }

        // Filter type
        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        // Sort
        $sort = $request->input('sort', 'sort_order');
        $direction = $request->input('direction', 'asc');
        $allowedSorts = ['sort_order', 'product_name', 'base_price', 'created_at'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
        }

        // Promo first
        $query->orderByDesc('is_promo');

        $products = $query->paginate($request->input('per_page', 20));

        return ProductResource::collection($products);
    }

    public function show(string $slug)
    {
        $product = Product::with('category', 'prices')
            ->where('is_active', true)
            ->where(function ($q) use ($slug) {
                $q->where('slug', $slug)->orWhere('id', $slug);
            })
            ->firstOrFail();

        // Load sibling products (same brand & category) as selectable price options
        $memberLevel = request()->user()?->member_level ?? 'guest';
        $siblings = Product::with('prices')
            ->where('category_id', $product->category_id)
            ->where('brand', $product->brand)
            ->where('is_active', true)
            ->orderBy('base_price')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->product_name,
                'sell_price' => $p->getPriceForLevel($memberLevel),
            ]);

        $product->setAttribute('sibling_prices', $siblings);

        return new ProductResource($product);
    }

    public function categories()
    {
        $categories = Cache::remember('categories_list', 3600, function () {
            return ProductCategory::where('is_active', true)
                ->withCount(['products' => fn($q) => $q->where('is_active', true)])
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug', 'icon', 'type']);
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function brands()
    {
        $brands = Cache::remember('brands_list', 3600, function () {
            return Product::where('is_active', true)
                ->whereNotNull('brand')
                ->distinct()
                ->pluck('brand')
                ->sort()
                ->values();
        });

        return response()->json([
            'success' => true,
            'data' => $brands,
        ]);
    }
}
