<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use Carbon\Carbon;

class Coupon extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'used_count',
        'category_id',
        'is_active',
        'starts_at',
        'expires_at'
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * Get the category this coupon applies to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    /**
     * Orders that have used this coupon.
     * Note: the orders table should include a `coupon_id` FK referencing coupons.id.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'coupon_id', 'id');
    }

    /**
     * Users who have claimed/saved this coupon (coupon_user pivot).
     * Pivot includes timestamps for when the coupon was attached.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'coupon_user', 'coupon_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Check if the coupon is valid.
     */
    public function isValid(): bool
    {
        // Check if coupon is active
        if (!$this->is_active) {
            return false;
        }

        // Check if coupon has started
        if ($this->starts_at && Carbon::now()->lt($this->starts_at)) {
            return false;
        }

        // Check if coupon has expired
        if ($this->expires_at && Carbon::now()->gt($this->expires_at)) {
            return false;
        }

        // Check if max uses reached
        if ($this->max_uses && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for a given subtotal.
     */
    public function calculateDiscount(float $subtotal, ?int $categoryId = null): float
    {
        // Check if coupon is valid
        if (!$this->isValid()) {
            return 0;
        }

        // Check minimum order amount
        if ($subtotal < $this->min_order_amount) {
            return 0;
        }

        // Check if category specific and matches
        if ($this->category_id && $this->category_id !== $categoryId) {
            return 0;
        }

        // Calculate discount
        if ($this->type === 'fixed') {
            return min($this->value, $subtotal);
        }

        // For percentage type
        return ($subtotal * $this->value) / 100;
    }

    /**
     * Increment the used count atomically with row locking to prevent race conditions.
     * This ensures that multiple concurrent orders cannot exceed max_uses limit.
     */
    public function incrementUsage(): bool
    {
        // Use atomic increment with database-level locking
        // This prevents race conditions where multiple requests could increment simultaneously
        return DB::transaction(function() {
            // Lock this coupon row for update
            $coupon = self::where('id', $this->id)->lockForUpdate()->first();
            
            if (!$coupon) {
                return false;
            }

            // Check if incrementing would exceed max_uses
            if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
                Log::warning('Attempted to use coupon that has reached max uses', [
                    'coupon_id' => $coupon->id,
                    'code' => $coupon->code,
                    'used_count' => $coupon->used_count,
                    'max_uses' => $coupon->max_uses
                ]);
                return false;
            }

            // Atomically increment
            $coupon->increment('used_count');
            
            // Refresh the current instance
            $this->refresh();
            
            return true;
        });
    }

    /**
     * Scope a query to only include valid coupons.
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', Carbon::now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->where(function ($q) {
                $q->whereNull('max_uses')
                    ->orWhereRaw('used_count < max_uses');
            });
    }
    /**
     * Check if the coupon is applicable for the given order amount.
     */
    public function isApplicable(float $orderAmount): bool
    {
        return $orderAmount >= $this->min_order_amount;
    }
}
