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
        if (! Schema::hasTable('coupon_user')) {
            return;
        }

        Schema::table('coupon_user', function (Blueprint $table) {
            if (! Schema::hasColumn('coupon_user', 'used')) {
                $table->boolean('used')->default(false)->after('updated_at');
            }

            if (! Schema::hasColumn('coupon_user', 'used_at')) {
                $table->timestamp('used_at')->nullable()->after('used');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('coupon_user')) {
            return;
        }

        Schema::table('coupon_user', function (Blueprint $table) {
            if (Schema::hasColumn('coupon_user', 'used_at')) {
                $table->dropColumn('used_at');
            }

            if (Schema::hasColumn('coupon_user', 'used')) {
                $table->dropColumn('used');
            }
        });
    }
};
