<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // If a users table already exists (from the project's base migrations), do not attempt to recreate it.
        if (Schema::hasTable('users')) {
            return;
        }

        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('user_id');
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('profile_image')->nullable();
            $table->enum('user_type', ['customer', 'admin'])->default('customer');
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            $table->timestamp('last_login')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
