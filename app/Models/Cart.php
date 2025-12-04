<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    use HasFactory;
    protected $table = 'cart';
    protected $primaryKey = 'cart_id';

    protected $fillable = [
        'user_id',
        'mission_id',
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Get the mission associated with the cart.
     */
    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
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
    public static function getOrCreateCartForUser($user = null)
    {
        $user = $user ?? auth()->user();
        
        if (!$user) {
            return null;
        }

        $cart = static::where('user_id', $user->id)->first();
        
        if (!$cart) {
            $cart = static::create([
                'user_id' => $user->id
            ]);
        }
        
        return $cart;
    }

    /**
     * Add an item to the cart.
     */
    public function addItem($productOrId, $quantity = 1, $isMissionItem = false)
    {
        $product = $productOrId instanceof \App\Models\Product ? $productOrId : \App\Models\Product::find($productOrId);

        if (!$product) {
            return $this;
        }

        $productId = $product->product_id;
        // Use getCurrentPrice() to be consistent with CheckoutController
        $price = $product->getCurrentPrice();
        


        $item = $this->items()->where('product_id', $productId)->first();

        if ($item) {
            $item->quantity += $quantity;
            // If it's being added again as a mission item, update the flag? 
            // Or should we keep it as is? Let's assume if added via loadout, we force it to be mission item.
            if ($isMissionItem) {
                $item->is_mission_item = true;
            }
            $item->save();
        } else {
            $this->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity,
                'price_at_add' => $price,
                'is_mission_item' => $isMissionItem,
            ]);
        }

        return $this;
    }
    /**
     * Remove an item from the cart.
     */
    public function removeItem($productId)
    {
        $this->items()->where('product_id', $productId)->delete();
    }

    /**
     * Clear the cart.
     */
    public function clear()
    {
        $this->items()->delete();
    }

    /**
     * Update the quantity of an item in the cart.
     */
    public function updateQuantity($productId, $quantity)
    {
        $item = $this->items()->where('product_id', $productId)->first();

        if ($item) {
            $item->quantity = $quantity;
            $item->save();
        }
    }

    /**
     * Calculate the total cost of the cart.
     */
    public function total()
    {
        return $this->items->sum(function ($item) {
            return $item->quantity * $item->product->price;
        });
    }
}








