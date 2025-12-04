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
        Schema::table('missions', function (Blueprint $table) {
            $table->enum('ab_group', ['A', 'B', 'none'])->default('none')->after('status');
            $table->foreignId('parent_mission_id')->nullable()->after('ab_group')->constrained('missions')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->dropForeign(['parent_mission_id']);
            $table->dropColumn(['ab_group', 'parent_mission_id']);
        });
    }
};
