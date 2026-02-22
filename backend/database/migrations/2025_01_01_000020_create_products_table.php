<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('product_categories')->cascadeOnDelete();
            $table->string('buyer_sku_code')->unique()->comment('SKU dari Digiflazz');
            $table->string('product_name');
            $table->string('slug')->unique();
            $table->string('brand')->nullable();
            $table->string('seller_name')->nullable();
            $table->decimal('base_price', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->enum('type', ['prepaid', 'postpaid'])->default('prepaid');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_promo')->default(false);
            $table->boolean('unlimited_stock')->default(true);
            $table->integer('stock')->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'is_active']);
            $table->index('brand');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
