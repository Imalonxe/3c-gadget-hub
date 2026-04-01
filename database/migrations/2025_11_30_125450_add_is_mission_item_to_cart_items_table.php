<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (!Schema::hasColumn('cart_items', 'is_mission_item')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->boolean('is_mission_item')->default(false)->after('price_at_add');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('is_mission_item');
        });
    }
};
