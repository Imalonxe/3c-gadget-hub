<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Mission;

// Replicate Controller Logic
$abTests = Mission::whereNull('parent_mission_id')
    ->whereHas('variants')
    ->with(['variants.analytics', 'analytics'])
    ->get()
    ->map(function ($parent) {
        $parentViews = $parent->analytics->sum('views');
        $parentCompletions = $parent->analytics->sum('completions');
        $parentRevenue = $parent->analytics->sum('revenue');
        $parentCR = $parentViews > 0 ? ($parentCompletions / $parentViews) : 0;

        $variants = $parent->variants->map(function ($variant) use ($parentCR) {
            $views = $variant->analytics->sum('views');
            $completions = $variant->analytics->sum('completions');
            $revenue = $variant->analytics->sum('revenue');
            $cr = $views > 0 ? ($completions / $views) : 0;
            
            $orders = \App\Models\Order::where('mission_id', $variant->id)->get();
            $orderCount = $orders->count();
            $totalDiscount = $orders->sum('discount');
            $aov = $orderCount > 0 ? $revenue / $orderCount : 0;

            $newUsers = 0;
            $returningUsers = 0;
            foreach ($orders as $order) {
                $hasPrevious = \App\Models\Order::where('user_id', $order->user_id)
                    ->where('order_id', '<', $order->order_id)
                    ->exists();
                if ($hasPrevious) {
                    $returningUsers++;
                } else {
                    $newUsers++;
                }
            }
            
            return [
                'id' => $variant->id,
                'orders' => $orderCount,
                'aov' => $aov,
                'segmentation' => ['new' => $newUsers, 'returning' => $returningUsers]
            ];
        });

        return [
            'id' => $parent->id,
            'variants' => $variants
        ];
    });

echo json_encode($abTests, JSON_PRETTY_PRINT);
