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
        \Illuminate\Support\Facades\DB::statement('
            UPDATE questions 
            SET answers_count = (
                SELECT COUNT(*) 
                FROM answers 
                WHERE answers.question_id = questions.id
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse operation needed for data sync
    }
};
