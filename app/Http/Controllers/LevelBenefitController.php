<?php

namespace App\Http\Controllers;

use App\Models\LevelBenefit;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LevelBenefitController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get current level benefit (cumulative)
        $currentBenefit = $user->getEffectiveLevelBenefits();

        // Calculate free shipping usage
        $freeShippingUsage = 0;
        $freeShippingLimit = null;
        
        if ($currentBenefit && $currentBenefit->free_shipping && $currentBenefit->free_shipping_limit) {
            $freeShippingLimit = $currentBenefit->free_shipping_limit;
            $freeShippingUsage = Order::where('user_id', $user->id)
                ->where('is_level_free_shipping', true)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
        }

        // Get all benefits for progression display
        $allBenefits = LevelBenefit::orderBy('level')->get();

        // Calculate XP thresholds based on User model formula: Level = floor(sqrt(XP / 100)) + 1
        // Therefore: XP = 100 * (Level - 1)^2
        $currentLevel = $user->level;
        $nextLevel = $currentLevel + 1;
        
        $currentLevelThreshold = 100 * pow($currentLevel - 1, 2);
        $nextLevelThreshold = 100 * pow($nextLevel - 1, 2);

        return Inertia::render('LevelBenefits/MyBenefits', [
            'currentBenefit' => $currentBenefit,
            'freeShippingUsage' => $freeShippingUsage,
            'allBenefits' => $allBenefits,
            'userLevel' => $user->level,
            'userXp' => $user->xp,
            'nextLevelThreshold' => $nextLevelThreshold,
            'currentLevelThreshold' => $currentLevelThreshold,
        ]);
    }
}
