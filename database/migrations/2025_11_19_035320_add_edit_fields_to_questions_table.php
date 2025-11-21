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
        Schema::table('questions', function (Blueprint $table) {
            $table->text('content_before_edit')->nullable()->after('content');
            $table->timestamp('edited_at')->nullable()->after('updated_at');
            $table->unsignedTinyInteger('edit_count')->default(0)->after('edited_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['content_before_edit', 'edited_at', 'edit_count']);
        });
    }
};
