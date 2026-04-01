<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\MissionAnalytics;

class OrderObserver
{
    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if payment status changed to 'paid'
        if ($order->isDirty('payment_status') && $order->payment_status === Order::PAYMENT_PAID) {
            
            // 1. Update Mission Analytics (if applicable)
            if ($order->mission_id) {
                $analytics = MissionAnalytics::firstOrCreate(
                    [
                        'mission_id' => $order->mission_id,
                        'date' => now()->toDateString(),
                    ],
                    [
                        'views' => 0,
                        'completions' => 0,
                        'revenue' => 0,
                    ]
                );

                $analytics->increment('completions');
                $analytics->increment('revenue', $order->total_amount);
            }

            // 2. Award XP to User
            if ($order->user) {
                $user = $order->user;
                
                // Award 1 XP per 10 Baht spent
                $xpEarned = floor($order->total_amount / 10);
                if ($xpEarned > 0) {
                    $user->addXp($xpEarned);
                }

                // 3. Check & Award Badges
                $this->checkBadges($user, $order);
            }
        }
    }

    /**
     * Check and award badges based on order.
     */
    protected function checkBadges($user, $order)
    {
        // Get all badges that are order-related
        $badges = \App\Models\Badge::whereIn('condition_type', ['orders_count', 'single_order_amount'])->get();
        
        // Pre-calculate user stats
        $ordersCount = $user->orders()->where('payment_status', Order::PAYMENT_PAID)->count();

        foreach ($badges as $badge) {
            // Skip if user already has this badge
            if ($user->badges()->where('badge_id', $badge->id)->exists()) {
                continue;
            }

            $awarded = false;

            if ($badge->condition_type === 'orders_count') {
                if ($ordersCount >= $badge->condition_value) {
                    $awarded = true;
                }
            } elseif ($badge->condition_type === 'single_order_amount') {
                if ($order->total_amount >= $badge->condition_value) {
                    $awarded = true;
                }
            }

            if ($awarded) {
                // Attach badge
                $user->badges()->attach($badge->id);
                
                // Award XP for badge
                if ($badge->xp_reward > 0) {
                    $user->addXp($badge->xp_reward);
                }

                // Create a notification for the badge
                // We can reuse the database notification system or create a specific BadgeNotification
                // For now, let's just log it or assume the user sees it on their profile
                // Ideally: $user->notify(new \App\Notifications\BadgeEarnedNotification($badge));
            }
        }
    }
}
