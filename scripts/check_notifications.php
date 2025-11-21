<?php
// Boot Laravel application for quick DB checks
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "QUEUE=" . env('QUEUE_CONNECTION') . PHP_EOL;
echo "BROADCAST=" . env('BROADCAST_DRIVER') . PHP_EOL;

try {
    $count = DB::table('notifications')->count();
    echo "NOTIFICATIONS_COUNT={$count}" . PHP_EOL;
    $rows = DB::table('notifications')->orderBy('created_at', 'desc')->limit(10)->get();
    foreach ($rows as $r) {
        echo json_encode((array) $r, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
try {
    $jobs = DB::table('jobs')->count();
    echo "JOBS_COUNT={$jobs}" . PHP_EOL;
    $jobsRows = DB::table('jobs')->orderBy('id', 'desc')->limit(10)->get();
    foreach ($jobsRows as $jr) {
        echo json_encode((array)$jr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'JOBS_ERROR: ' . $e->getMessage() . PHP_EOL;
}
