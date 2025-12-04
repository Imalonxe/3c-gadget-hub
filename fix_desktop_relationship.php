<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$variant = App\Models\Mission::find(2); // Group B
$control = App\Models\Mission::find(4); // Group A

if ($variant && $control) {
    $variant->parent_mission_id = $control->id;
    $variant->save();
    echo "Successfully linked Mission {$variant->id} (Group {$variant->ab_group}) to Parent {$control->id} (Group {$control->ab_group})\n";
} else {
    echo "Could not find missions.\n";
}
