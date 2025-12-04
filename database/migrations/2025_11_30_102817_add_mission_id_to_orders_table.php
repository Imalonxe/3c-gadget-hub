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
        if (!Schema::hasColumn('orders', 'mission_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('mission_id')->nullable();
                $table->foreign('mission_id')->references('id')->on('missions')->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['mission_id']);
            $table->dropColumn('mission_id');
        });
    }
};
