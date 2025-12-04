<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasColumn('orders', 'coupon_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('coupon_id')->nullable()->after('discount');
                $table->foreign('coupon_id')->references('id')->on('coupons')->onDelete('set null');
            });
        }
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['coupon_id']);
            $table->dropColumn('coupon_id');
        });
    }
};
