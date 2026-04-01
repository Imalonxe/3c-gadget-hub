<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\SendVerificationCodeNotification;
use App\Models\EmailVerificationCode;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        \Illuminate\Support\Facades\Log::info('Sending verification code to user: ' . $this->id);
        try {
            $verificationCode = EmailVerificationCode::createForUser($this);
            \Illuminate\Support\Facades\Log::info('Verification code created: ' . $verificationCode->code);
            $this->notify(new SendVerificationCodeNotification($verificationCode->code));
            \Illuminate\Support\Facades\Log::info('Notification dispatched');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error sending verification code: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get the user's cart items.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Coupons the user has saved/collected (pivot table coupon_user)
     */
    public function coupons()
    {
        // Include pivot columns for 'used' and 'used_at' so we can track
        // whether a claimed coupon has been consumed by an order.
        return $this->belongsToMany(Coupon::class, 'coupon_user', 'user_id', 'coupon_id')
            ->withTimestamps()
            ->withPivot('used', 'used_at');
    }

    /**
     * User saved addresses (shipping/billing)
     */
    public function addresses()
    {
        return $this->hasMany(\App\Models\Address::class, 'user_id', 'id')->orderBy('is_default', 'desc');
    }

    /**
     * Get the orders for the user.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the total number of items in the user's cart.
     */
    public function getCartCountAttribute()
    {
        return $this->cartItems()->sum('quantity');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type',
        'is_admin',
        'first_name',
        'last_name',
        'banned_until',
        'ban_reason',
        'xp',
        'level',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
        'banned_until' => 'datetime',
    ];

    /**
     * Return whether the user is an admin.
     *
     * This checks multiple possible columns so it works whether the DB uses
     * `is_admin` (boolean) or `user_type` (enum 'admin').
     */
    public function isAdmin(): bool
    {
        // prefer explicit boolean column when present
        if (isset($this->is_admin)) {
            return (bool) $this->is_admin;
        }

        // fallback to user_type enum if present
        if (isset($this->user_type)) {
            return $this->user_type === 'admin';
        }

        return false;
    }

    /**
     * Check if the user can perform a specific action.
     */
    public function can($abilities, $arguments = [])
    {
        if (is_string($abilities) && $abilities === 'manage coupons') {
            return $this->is_admin;
        }

        return parent::can($abilities, $arguments);
    }

    /**
     * Check if the user is currently banned.
     */
    public function isBanned(): bool
    {
        return $this->banned_until && now()->lessThan($this->banned_until);
    }

    /**
     * Add XP to the user and check for level up.
     */
    public function addXp(int $amount)
    {
        $this->increment('xp', $amount);

        // Simple Leveling Formula: Level = floor(sqrt(XP / 100)) + 1
        // Or specific thresholds. Let's use a simple formula for now.
        // XP required for level L = 100 * (L-1)^2
        
        $newLevel = floor(sqrt($this->xp / 100)) + 1;

        if ($newLevel > $this->level) {
            $this->update(['level' => $newLevel]);
            // You could trigger a LevelUpNotification here
        }
    }

    /**
     * Get the badges for the user.
     */
    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('awarded_at')
            ->withTimestamps();
    }

    /**
     * Get the effective level benefits for the user (cumulative).
     */
    public function getEffectiveLevelBenefits()
    {
        $currentLevel = $this->level ?? 1;
        $benefits = \App\Models\LevelBenefit::where('level', '<=', $currentLevel)->get();

        $discount = $benefits->max('discount_percentage') ?? 0;

        $shippingBenefits = $benefits->where('free_shipping', true);
        $hasFreeShipping = $shippingBenefits->isNotEmpty();
        $limit = 0;

        if ($hasFreeShipping) {
            // If any benefit has null limit, it means unlimited
            if ($shippingBenefits->contains('free_shipping_limit', null)) {
                $limit = null;
            } else {
                $limit = $shippingBenefits->max('free_shipping_limit');
            }
        }

        return (object) [
            'discount_percentage' => $discount,
            'free_shipping' => $hasFreeShipping,
            'free_shipping_limit' => $limit
        ];
    }
}
