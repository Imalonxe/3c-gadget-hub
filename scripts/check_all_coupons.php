<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

$user = User::find(1);
if (! $user) {
    echo "No user id=1\n";
    exit(0);
}

if (! auth()->loginUsingId($user->id)) {
    // try manual binding
}

echo "User: {$user->id} ({$user->name})\n";

// emulate CouponController::all logic for authenticated user
$query = $user->coupons();
if (Schema::hasColumn('coupon_user', 'used')) {
    try {
        $query = $query->wherePivot('used', false);
    } catch (Exception $e) {
        // ignore
    }
}

$coupons = $query->valid()->orderBy('created_at', 'desc')->get();

if (Schema::hasColumn('coupon_user', 'used')) {
    $coupons = $coupons->filter(function ($c) {
        return isset($c->pivot) ? (!isset($c->pivot->used) || !$c->pivot->used) : true;
    })->values();
}

echo "Coupons returned: " . $coupons->count() . "\n";
foreach ($coupons as $c) {
    $used = isset($c->pivot) && isset($c->pivot->used) ? ($c->pivot->used ? 'used' : 'unused') : 'unknown';
    echo "- {$c->id} {$c->code} ({$used})\n";
}
