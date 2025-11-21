<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Coupon;
use Illuminate\Support\Facades\Schema;

$user = User::first();
$coupon = Coupon::first();
if (! $user || ! $coupon) {
    echo "User or Coupon missing\n";
    exit(0);
}

echo "User: {$user->id}, Coupon: {$coupon->id} ({$coupon->code})\n";
// attach
$user->coupons()->syncWithoutDetaching([$coupon->id]);
$exists = $user->coupons()->where('coupons.id', $coupon->id)->exists();
echo "attached exists? " . ($exists ? 'yes' : 'no') . "\n";

if (Schema::hasColumn('coupon_user','used')) {
    $usedBefore = $user->coupons()->where('coupons.id', $coupon->id)->wherePivot('used', true)->exists();
    echo "used before? " . ($usedBefore ? 'yes' : 'no') . "\n";
    // mark used
    $user->coupons()->updateExistingPivot($coupon->id, ['used'=>true, 'used_at'=>now()]);
    $usedAfter = $user->coupons()->where('coupons.id', $coupon->id)->wherePivot('used', true)->exists();
    echo "used after? " . ($usedAfter ? 'yes' : 'no') . "\n";
} else {
    echo "Pivot does not have 'used' column\n";
}

// cleanup: leave pivot as-is (we intentionally want used=true)

echo "Done\n";
