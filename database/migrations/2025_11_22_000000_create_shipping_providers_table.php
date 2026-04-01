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
        Schema::create('shipping_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Kerry Express", "J&T Express"
            $table->string('code')->unique(); // e.g., "kerry", "jnt"
            $table->decimal('base_fee', 10, 2)->default(0); // base shipping fee
            $table->text('description')->nullable(); // provider description
            $table->string('logo_url')->nullable(); // logo image URL
            $table->integer('estimated_days')->default(3); // estimated delivery days
            $table->boolean('is_active')->default(true); // active status
            $table->integer('sort_order')->default(0); // display order
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_providers');
    }
};
