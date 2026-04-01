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
        if (!Schema::hasColumn('level_benefits', 'free_shipping_limit')) {
            Schema::table('level_benefits', function (Blueprint $table) {
                $table->integer('free_shipping_limit')->nullable()->after('free_shipping');
            });
        }

        if (!Schema::hasColumn('orders', 'is_level_free_shipping')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->boolean('is_level_free_shipping')->default(false)->after('mission_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('level_benefits', function (Blueprint $table) {
            $table->dropColumn('free_shipping_limit');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('is_level_free_shipping');
        });
    }
};
