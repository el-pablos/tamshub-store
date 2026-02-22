<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('member_level', ['guest', 'bronze', 'silver', 'gold', 'reseller']);
            $table->decimal('margin_percent', 8, 2)->default(10);
            $table->decimal('override_price', 15, 2)->nullable()->comment('Override harga final, nullable = pakai margin');
            $table->timestamps();

            $table->unique(['product_id', 'member_level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_prices');
    }
};
