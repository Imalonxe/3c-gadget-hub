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
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'average_rating')) {
                $table->decimal('average_rating', 3, 1)->default(0)->after('compare_price');
            }
            if (!Schema::hasColumn('products', 'total_reviews')) {
                $table->unsignedInteger('total_reviews')->default(0)->after('average_rating');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'total_reviews')) {
                $table->dropColumn('total_reviews');
            }
            if (Schema::hasColumn('products', 'average_rating')) {
                $table->dropColumn('average_rating');
            }
        });
    }
};
