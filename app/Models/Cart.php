<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $table = 'cart';
    protected $primaryKey = 'cart_id';

    protected $fillable = [
        'user_id',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the cart items for the cart.
     */
    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class, 'cart_id', 'cart_id');
    }

    /**
     * Get or create cart for the authenticated user.
     */
    public static function getOrCreateCartForUser()
    {
        $userId = auth()->id();
        
        $cart = static::where('user_id', $userId)->first();
        
        if (!$cart) {
            $cart = static::create([
                'user_id' => $userId
            ]);
        }
        
        return $cart;
    }
}








