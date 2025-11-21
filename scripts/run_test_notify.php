<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;
use Illuminate\Support\Facades\DB;

$order = Order::where('order_status', '!=', Order::STATUS_SHIPPING)->first();
if (! $order) {
    echo "No order found to update\n";
    exit(0);
}

$old = $order->order_status;
$order->order_status = Order::STATUS_SHIPPING;
$order->save();

try {
    $order->user->notify(new App\Notifications\OrderStatusNotification($order, $old));
    echo "Notify called for order {$order->order_id}\n";
} catch (Exception $e) {
    echo "Notify failed: " . $e->getMessage() . "\n";
}

echo "JOBS=" . DB::table('jobs')->count() . "\n";
echo "NOTIFICATIONS=" . DB::table('notifications')->count() . "\n";
$jobs = DB::table('jobs')->orderBy('id','desc')->limit(5)->get();
foreach ($jobs as $j) {
    echo json_encode((array)$j) . "\n";
}

$rows = DB::table('notifications')->orderBy('created_at','desc')->limit(5)->get();
foreach ($rows as $r) {
    echo json_encode((array)$r) . "\n";
}
