<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaderboard_snapshots', function (Blueprint $table) {
            $table->id();
            $table->enum('period', ['daily', 'weekly', 'monthly']);
            $table->string('user_display')->comment('Nama tersensor');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->integer('total_transactions')->default(0);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->date('snapshot_date');
            $table->timestamps();

            $table->index(['period', 'snapshot_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard_snapshots');
    }
};
