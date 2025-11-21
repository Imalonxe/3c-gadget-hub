<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('stock_history', function (Blueprint $table) {
            $table->bigIncrements('history_id');
            $table->unsignedBigInteger('product_id');
            $table->enum('change_type', ['sale','restock','return','adjustment']);
            $table->integer('quantity_change');
            $table->integer('old_quantity')->nullable();
            $table->integer('new_quantity')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_history');
    }
};
