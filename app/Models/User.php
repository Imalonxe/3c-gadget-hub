<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\VerifyEmailNotification;

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
        $this->notify(new VerifyEmailNotification);
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
        'last_name'
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
}
