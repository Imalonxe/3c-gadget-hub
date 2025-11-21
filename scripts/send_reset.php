<?php
// One-off script to trigger Laravel's password reset notification for a user.
// Run with: php scripts/send_reset.php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Password;

$email = 'spk1987ky210120@gmail.com';
$user = User::where('email', $email)->first();

if (! $user) {
    echo "NO_USER\n";
    exit(1);
}

$token = Password::broker()->createToken($user);
$user->sendPasswordResetNotification($token);

echo "SENT\n";
