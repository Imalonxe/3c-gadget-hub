<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('social_logins', function (Blueprint $table) {
            $table->bigIncrements('social_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('provider', ['google', 'facebook', 'twitter']);
            $table->string('provider_user_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('social_logins');
    }
};
