<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('qa_answers', function (Blueprint $table) {
            $table->bigIncrements('answer_id');
            $table->unsignedBigInteger('qa_id');
            $table->unsignedBigInteger('user_id');
            $table->text('answer');
            $table->boolean('is_admin')->default(false);
            $table->boolean('is_accepted')->default(false);
            $table->unsignedBigInteger('helpful_count')->default(0);
            $table->timestamps();

            $table->foreign('qa_id')->references('qa_id')->on('qa_forums')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('qa_answers');
    }
};
