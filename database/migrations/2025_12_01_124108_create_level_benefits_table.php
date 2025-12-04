<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('level_benefits', function (Blueprint $table) {
            $table->id();
            $table->integer('level')->unique();
            $table->decimal('discount_percentage', 5, 2)->default(0); // e.g., 5.00 for 5%
            $table->boolean('free_shipping')->default(false);
            $table->json('custom_benefits')->nullable(); // For future flexibility
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('level_benefits');
    }
};
