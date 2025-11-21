<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change type from ENUM to VARCHAR to allow additional types (e.g. free_shipping)
        DB::statement("ALTER TABLE `coupons` MODIFY `type` VARCHAR(50) NOT NULL;");

        // Allow value to be nullable for coupons like free_shipping that don't need a monetary value
        DB::statement("ALTER TABLE `coupons` MODIFY `value` DECIMAL(10,2) NULL;");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to the original enum definition (may fail if other types exist)
        DB::statement("ALTER TABLE `coupons` MODIFY `type` ENUM('fixed','percentage') NOT NULL;");

        // Revert value to NOT NULL (set default 0 to avoid errors)
        DB::statement("ALTER TABLE `coupons` MODIFY `value` DECIMAL(10,2) NOT NULL DEFAULT 0;");
    }
};
