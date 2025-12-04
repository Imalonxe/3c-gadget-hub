<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$missions = App\Models\Mission::all();
foreach ($missions as $mission) {
    echo "ID: {$mission->id}, Name: {$mission->name}, Group: " . ($mission->ab_group ?? 'NULL') . "\n";
}
