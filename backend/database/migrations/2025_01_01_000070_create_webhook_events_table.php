<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('provider')->default('digiflazz');
            $table->string('ref_id')->nullable();
            $table->string('status')->nullable();
            $table->string('buyer_sku_code')->nullable();
            $table->string('sn')->nullable()->comment('Serial number');
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index('ref_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
