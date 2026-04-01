<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get all badges
        $allBadges = Badge::all();
        
        // Get user's earned badge IDs
        $earnedBadgeIds = $user->badges()->pluck('badges.id')->toArray();

        return Inertia::render('Badges/Index', [
            'badges' => $allBadges,
            'earnedBadgeIds' => $earnedBadgeIds,
            'userXp' => $user->xp,
            'userLevel' => $user->level,
        ]);
    }
}
