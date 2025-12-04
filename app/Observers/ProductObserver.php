<?php

namespace App\Observers;

use App\Models\Product;
use App\Notifications\PriceDropNotification;

class ProductObserver
{
    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        // Check if price or sale_price has changed
        if ($product->isDirty('price') || $product->isDirty('sale_price')) {
            $currentPrice = $product->getCurrentPrice();

            // Find active alerts for this product
            $alerts = $product->priceAlerts()->where('status', 'active')->get();

            foreach ($alerts as $alert) {
                // Logic: Notify if price is lower than initial price OR meets target price
                $shouldNotify = false;

                if ($alert->target_price && $currentPrice <= $alert->target_price) {
                    $shouldNotify = true;
                } elseif (!$alert->target_price && $currentPrice < $alert->initial_price) {
                    $shouldNotify = true;
                }

                if ($shouldNotify) {
                    $alert->user->notify(new PriceDropNotification($product, $currentPrice));
                    
                    // Optional: Mark alert as notified so they don't get spammed?
                    // Or keep it active for further drops?
                    // Let's mark as notified for now to prevent spam on minor edits.
                    // User can re-enable if they want.
                    $alert->update(['status' => 'notified']);
                }
            }
        }
    }
}
