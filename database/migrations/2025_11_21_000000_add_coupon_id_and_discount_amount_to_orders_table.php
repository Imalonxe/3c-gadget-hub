<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add coupon_id column if not exists
            if (!Schema::hasColumn('orders', 'coupon_id')) {
                $table->unsignedBigInteger('coupon_id')->nullable()->after('discount');
                $table->foreign('coupon_id')->references('id')->on('coupons')->onDelete('set null');
            }

            // Add discount_amount column if not exists (separate from discount field)
            if (!Schema::hasColumn('orders', 'discount_amount')) {
                $table->decimal('discount_amount', 12, 2)->default(0)->after('coupon_id');
            }
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop foreign key if exists
            if (Schema::hasColumn('orders', 'coupon_id')) {
                $table->dropForeignIdFor('Coupon');
            }

            // Drop columns
            $table->dropColumn(['coupon_id', 'discount_amount']);
        });
    }
};
