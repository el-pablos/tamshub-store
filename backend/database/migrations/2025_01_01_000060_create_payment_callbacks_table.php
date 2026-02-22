<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_callbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('merchant_code')->nullable();
            $table->string('reference')->nullable();
            $table->string('payment_code')->nullable();
            $table->decimal('amount', 15, 2)->nullable();
            $table->string('status_code')->nullable();
            $table->string('status_message')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_callbacks');
    }
};
