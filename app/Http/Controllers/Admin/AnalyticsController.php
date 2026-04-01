<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\MissionAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Top Missions by Revenue
        $topMissions = Mission::withSum('analytics', 'revenue')
            ->withSum('analytics', 'completions')
            ->withSum('analytics', 'views')
            ->orderByDesc('analytics_sum_revenue')
            ->take(5)
            ->get();

        // Daily Stats (Last 30 Days)
        $dailyStats = MissionAnalytics::select(
                'date',
                DB::raw('SUM(revenue) as total_revenue'),
                DB::raw('SUM(completions) as total_completions'),
                DB::raw('SUM(views) as total_views')
            )
            ->where('date', '>=', now()->subDays(29)) // Last 30 days including today
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing dates
        $filledStats = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $stat = $dailyStats->get($date);

            $filledStats->push([
                'date' => $date,
                'total_revenue' => $stat ? $stat->total_revenue : 0,
                'total_completions' => $stat ? $stat->total_completions : 0,
                'total_views' => $stat ? $stat->total_views : 0,
            ]);
        }

        // A/B Testing Analysis
        $abTests = Mission::whereNull('parent_mission_id')
            ->whereHas('variants')
            ->with(['variants.analytics', 'analytics'])
            ->get()
            ->map(function ($parent) {
                // Calculate Parent (Control) Stats
                $parentViews = $parent->analytics->sum('views');
                $parentCompletions = $parent->analytics->sum('completions');
                $parentRevenue = $parent->analytics->sum('revenue');
                $parentCR = $parentViews > 0 ? ($parentCompletions / $parentViews) : 0;

                $variants = $parent->variants->map(function ($variant) use ($parentCR, $parentRevenue, $parentViews) {
                    $views = $variant->analytics->sum('views');
                    $completions = $variant->analytics->sum('completions');
                    $revenue = $variant->analytics->sum('revenue');
                    $cr = $views > 0 ? ($completions / $views) : 0;
                    
                    // Fetch Orders for this variant
                    $orders = \App\Models\Order::where('mission_id', $variant->id)->get();
                    $orderCount = $orders->count();
                    $totalDiscount = $orders->sum('discount');
                    $aov = $orderCount > 0 ? $revenue / $orderCount : 0;

                    // Segmentation: New vs Returning
                    $newUsers = 0;
                    $returningUsers = 0;
                    foreach ($orders as $order) {
                        // Check if user has previous orders
                        $hasPrevious = \App\Models\Order::where('user_id', $order->user_id)
                            ->where('order_id', '<', $order->order_id)
                            ->exists();
                        if ($hasPrevious) {
                            $returningUsers++;
                        } else {
                            $newUsers++;
                        }
                    }
                    
                    // Calculate Lift
                    $lift = $parentCR > 0 ? (($cr - $parentCR) / $parentCR) * 100 : 0;

                    // Simple Statistical Significance (Z-score approximation for CR)
                    $isSignificant = false;
                    $confidence = 0;
                    
                    if ($views > 0 && $parentCR > 0) { 
                         $se1 = sqrt(($parentCR * (1 - $parentCR)) / ($parentViews ?: 1));
                         $se2 = sqrt(($cr * (1 - $cr)) / $views);
                         
                         if ($se1 > 0 && $se2 > 0) {
                             $zScore = ($cr - $parentCR) / sqrt(pow($se1, 2) + pow($se2, 2));
                             $isSignificant = abs($zScore) > 1.96;
                             $confidence = abs($zScore);
                         }
                    }

                    return [
                        'id' => $variant->id,
                        'name' => $variant->name,
                        'group' => $variant->ab_group,
                        'views' => $views,
                        'completions' => $completions,
                        'orders' => $orderCount,
                        'revenue' => $revenue,
                        'conversion_rate' => $cr * 100,
                        'lift' => $lift,
                        'is_significant' => $isSignificant,
                        'confidence_score' => $confidence,
                        'aov' => $aov,
                        'total_discount' => $totalDiscount,
                        'segmentation' => [
                            'new' => $newUsers,
                            'returning' => $returningUsers
                        ]
                    ];
                });

                // Calculate Parent (Control) Extra Metrics
                $parentOrders = \App\Models\Order::where('mission_id', $parent->id)->get();
                $parentOrderCount = $parentOrders->count();
                $parentAOV = $parentOrderCount > 0 ? $parentRevenue / $parentOrderCount : 0;
                $parentDiscount = $parentOrders->sum('discount');
                
                $parentNew = 0;
                $parentReturning = 0;
                foreach ($parentOrders as $order) {
                    $hasPrevious = \App\Models\Order::where('user_id', $order->user_id)
                        ->where('order_id', '<', $order->order_id)
                        ->exists();
                    if ($hasPrevious) {
                        $parentReturning++;
                    } else {
                        $parentNew++;
                    }
                }

                return [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'group' => $parent->ab_group,
                    'views' => $parentViews,
                    'completions' => $parentCompletions,
                    'orders' => $parentOrderCount,
                    'revenue' => $parentRevenue,
                    'conversion_rate' => $parentCR * 100,
                    'aov' => $parentAOV,
                    'total_discount' => $parentDiscount,
                    'segmentation' => [
                        'new' => $parentNew,
                        'returning' => $parentReturning
                    ],
                    'variants' => $variants
                ];
            });

        // Fetch all missions for the experiment manager
        $availableMissions = Mission::select('id', 'name', 'ab_group', 'parent_mission_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Analytics/Index', [
            'topMissions' => $topMissions,
            'dailyStats' => $filledStats,
            'abTests' => $abTests,
            'availableMissions' => $availableMissions,
        ]);
    }

    public function storeExperiment(Request $request)
    {
        $request->validate([
            'parent_id' => 'required|exists:missions,id',
            'variant_ids' => 'required|array',
            'variant_ids.*' => 'exists:missions,id'
        ]);

        $parent = Mission::findOrFail($request->parent_id);
        
        // Validation: Parent must be Group A
        if ($parent->ab_group !== 'A') {
            return back()->withErrors(['parent_id' => 'Control mission must be Group A.']);
        }

        foreach ($request->variant_ids as $variantId) {
            $variant = Mission::findOrFail($variantId);
            
            // Validation: Variant must be Group B
            if ($variant->ab_group !== 'B') {
                continue; // Skip invalid groups
            }
            
            // Validation: Cannot link to itself
            if ($variant->id === $parent->id) {
                continue;
            }

            $variant->parent_mission_id = $parent->id;
            $variant->save();
        }

        return back()->with('success', 'Experiment updated successfully.');
    }

    public function destroyExperiment(Mission $mission)
    {
        $mission->parent_mission_id = null;
        $mission->save();

        return back()->with('success', 'Variant unlinked successfully.');
    }
}
