<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$couponId = 5;
$coupon = \App\Models\Coupon::find($couponId);

if (!$coupon) {
    echo "Coupon $couponId not found.\n";
    exit;
}

echo "Coupon: {$coupon->code} (ID: {$coupon->id})\n";
echo "Type: {$coupon->type}, Value: {$coupon->value}\n";
echo "Used Count: {$coupon->used_count}\n";

// Check users relation
$coupon->load(['users' => function($q) {
     if (Schema::hasColumn('coupon_user', 'used')) {
         $q->withPivot(['used', 'used_at', 'created_at']);
     }
}]);

echo "Users count: " . $coupon->users->count() . "\n";

$usersWhoUsed = $coupon->users->filter(function($u) {
    $used = isset($u->pivot->used) ? $u->pivot->used : true;
    echo "User {$u->id} ({$u->name}): Used flag = " . ($used ? 'TRUE' : 'FALSE') . "\n";
    return $used;
});

if ($usersWhoUsed->isEmpty()) {
    echo "No users marked as having used this coupon.\n";
} else {
    $userIds = $usersWhoUsed->pluck('id');
    echo "User IDs to check: " . $userIds->implode(', ') . "\n";

    $candidates = \App\Models\Order::whereIn('user_id', $userIds)->get();

    echo "Found " . $candidates->count() . " TOTAL orders for these users.\n";

    // Simulate Controller Logic
    $unlinkedOrders = collect();
    foreach ($candidates as $candidate) {
        // Only consider candidates with NO coupon_id for fuzzy match
        if ($candidate->coupon_id) continue;
        if ($candidate->discount <= 0) continue;

        $isMatch = false;
        if ($coupon->type === 'fixed') {
            if (abs($candidate->discount - $coupon->value) < 0.01) {
                $isMatch = true;
            }
        } elseif ($coupon->type === 'percent') {
             $expected = $candidate->subtotal * ($coupon->value / 100);
             if (abs($candidate->discount - $expected) < 1.0) { 
                 $isMatch = true;
             }
        }
        
        if ($isMatch) {
            $unlinkedOrders->push($candidate);
            echo "  -> Fuzzy Match Found: Order {$candidate->order_id}\n";
        }
    }

    // Load linked orders
    $linkedOrders = $coupon->orders;
    echo "Linked Orders Count: " . $linkedOrders->count() . "\n";

    $allOrders = $linkedOrders->merge($unlinkedOrders);
    echo "Total Merged Orders: " . $allOrders->count() . "\n";

    $totalDiscount = 0;
    foreach ($allOrders as $order) {
        $d_amount = $order->discount_amount;
        $d_col = $order->discount;
        echo "  Order {$order->order_id}: discount_amount=" . var_export($d_amount, true) . ", discount=" . var_export($d_col, true) . "\n";
        echo "  Attributes: " . json_encode($order->getAttributes()) . "\n";
        
        $d = $order->discount_amount ?? $order->discount ?? 0;
        echo "  Resolved Discount Value = $d\n";
        $totalDiscount += $d;
    }

    echo "Calculated Total Discount: $totalDiscount\n";
}


