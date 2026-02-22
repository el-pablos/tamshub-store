<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->string('target_id')->comment('Nomor tujuan / ID game');
            $table->string('zone_id')->nullable()->comment('Server/Zone ID game');
            $table->decimal('base_price', 15, 2);
            $table->decimal('sell_price', 15, 2);
            $table->decimal('payment_fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->enum('status', ['pending', 'paid', 'processing', 'success', 'failed', 'refunded', 'expired'])->default('pending');
            $table->enum('system_mode', ['autopilot', 'manual'])->default('autopilot');
            $table->boolean('admin_approved')->default(false);
            $table->text('admin_notes')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_channel')->nullable();
            $table->string('payment_ref')->nullable();
            $table->string('payment_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->string('provider_ref')->nullable()->comment('Ref ID dari Digiflazz');
            $table->string('provider_sn')->nullable()->comment('Serial Number dari Digiflazz');
            $table->enum('provider_status', ['pending', 'sukses', 'gagal'])->nullable();
            $table->timestamp('provider_completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('created_at');
            $table->index(['user_id', 'status']);
            $table->index('payment_ref');
            $table->index('provider_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
