<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$parent = App\Models\Mission::where('name', 'Gaming Set Group A')->first();
$child = App\Models\Mission::where('name', 'Gaming Set Group B')->first();

if ($parent && $child) {
    $child->parent_mission_id = $parent->id;
    $child->save();
    echo "Updated child mission {$child->id} to have parent {$parent->id}\n";
} else {
    echo "Could not find missions\n";
}
