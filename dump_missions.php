<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$missions = App\Models\Mission::select('id', 'name', 'ab_group', 'parent_mission_id')->get();
echo json_encode($missions, JSON_PRETTY_PRINT);
