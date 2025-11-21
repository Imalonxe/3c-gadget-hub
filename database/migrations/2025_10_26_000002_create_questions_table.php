<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // products table uses 'product_id' as the primary key (not the default 'id'),
            // so explicitly constrain to products.product_id to avoid FK errors on MySQL.
            $table->foreignId('product_id')->nullable()->constrained('products', 'product_id')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->string('status')->default('published');
            $table->boolean('is_answered')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->integer('views_count')->default(0);
            $table->integer('votes_count')->default(0);
            $table->integer('answers_count')->default(0);
            $table->json('tags')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
};