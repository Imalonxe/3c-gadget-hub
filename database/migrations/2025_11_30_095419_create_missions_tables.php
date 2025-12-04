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
        if (!Schema::hasTable('missions')) {
            Schema::create('missions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->enum('discount_type', ['percent', 'fixed'])->default('percent');
                $table->decimal('discount_value', 8, 2);
                $table->boolean('status')->default(true);
                $table->string('image_path')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('mission_slots')) {
            Schema::create('mission_slots', function (Blueprint $table) {
                $table->id();
                $table->foreignId('mission_id')->constrained()->onDelete('cascade');
                $table->foreignId('category_id')->constrained('categories', 'category_id')->onDelete('cascade');
                $table->integer('slot_order')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_slots');
        Schema::dropIfExists('missions');
    }
};
