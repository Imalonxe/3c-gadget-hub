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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->string('title');
            $table->text('content')->nullable();
            $table->string('status')->default('pending');
            $table->string('slug')->unique();
            $table->boolean('is_answered')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->integer('votes_count')->default(0);
            $table->unsignedInteger('answers_count')->default(0);
            $table->timestamp('last_activity_at')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
