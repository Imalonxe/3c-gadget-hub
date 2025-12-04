<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    use LogsActivity;
    /**
     * Display the user's cart.
     */
    public function index(): Response
    {
        $cart = Cart::getOrCreateCartForUser();
        
        $cartItems = CartItem::where('cart_id', $cart->cart_id)
            ->with(['product' => function($query) {
                $query->with(['images']);
            }])
            ->get();

        $subtotal = $cartItems->sum(function($item) {
            return $item->quantity * $item->price_at_add;
        });

        // Calculate Mission Discount
        $missionDiscount = 0;
        $mission = null;
        if ($cart->mission_id) {
            $mission = \App\Models\Mission::find($cart->mission_id);
            if ($mission && $mission->status) {
                // Calculate subtotal of ONLY mission items
                $missionSubtotal = $cartItems->where('is_mission_item', true)->sum(function($item) {
                    return $item->quantity * $item->price_at_add;
                });

                if ($mission->discount_type === 'percent') {
                    $missionDiscount = ($missionSubtotal * $mission->discount_value) / 100;
                } else {
                    // For fixed discount, we should probably cap it at missionSubtotal?
                    // Or is it a fixed discount on the whole mission set? 
                    // Assuming fixed discount applies if mission criteria met.
                    // But if it's a fixed discount value (e.g. 500 baht off), it shouldn't exceed the mission items total?
                    // Let's assume standard behavior: min(discount, missionSubtotal)
                    $missionDiscount = min($mission->discount_value, $missionSubtotal);
                }
            }
        }

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'subtotal' => $subtotal,
            'missionDiscount' => $missionDiscount,
            'missionName' => $mission ? $mission->name : null,
        ]);
    }

    /**
     * Add item to cart.
     */
    public function add(Request $request, $productId)
    {
        // Use database transaction with row locking to prevent race conditions
        return DB::transaction(function() use ($request, $productId) {
            // Lock the product row for update to prevent concurrent modifications
            $product = Product::where('product_id', $productId)
                ->lockForUpdate()
                ->firstOrFail();

            // accept a requested quantity (default 1)
            $quantity = (int) $request->input('quantity', 1);
            if ($quantity < 1) {
                $quantity = 1;
            }

            // Check stock
            if ($product->stock_quantity <= 0) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json(['message' => 'Product is out of stock.'], 422);
                }
                return back()->with('error', 'Product is out of stock.');
            }

            // Get or create cart for user
            $cart = Cart::getOrCreateCartForUser();

            // Check if item already exists in cart
            $existingItem = CartItem::where('cart_id', $cart->cart_id)
                ->where('product_id', $productId)
                ->first();

            if ($existingItem) {
                // Update quantity if stock allows
                $newQuantity = $existingItem->quantity + $quantity;
                if ($newQuantity > $product->stock_quantity) {
                    if ($request->wantsJson() || $request->ajax()) {
                        return response()->json(['message' => 'Not enough stock available.'], 422);
                    }
                    return back()->with('error', 'Not enough stock available.');
                }
                $existingItem->update(['quantity' => $newQuantity]);
            } else {
                // Create new cart item with requested quantity
                if ($quantity > $product->stock_quantity) {
                    if ($request->wantsJson() || $request->ajax()) {
                        return response()->json(['message' => 'Not enough stock available.'], 422);
                    }
                    return back()->with('error', 'Not enough stock available.');
                }

                CartItem::create([
                    'cart_id' => $cart->cart_id,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'price_at_add' => $product->getCurrentPrice(),
                    'added_at' => now(),
                ]);
            }

            // Log add to cart action
            $this->logActivity('add_to_cart', [
                'product_id' => $productId,
                'product_name' => $product->product_name,
                'quantity' => $quantity,
            ]);

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['message' => 'Item added to cart successfully.']);
            }

            return redirect()->back()->with('success', 'Item added to cart successfully.');
        });
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        $quantity = $request->input('quantity', 1);

        // Check stock
        if ($quantity > $product->stock_quantity) {
            return back()->with('error', 'Not enough stock available.');
        }

        $cart = Cart::getOrCreateCartForUser();
        
        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $cartItem->update(['quantity' => $quantity]);

        // Log cart update
        $this->logActivity('update_cart', [
            'product_id' => $productId,
            'product_name' => $product->product_name,
            'old_quantity' => $cartItem->getOriginal('quantity'),
            'new_quantity' => $quantity,
        ]);

        // Check if mission is still valid
        $this->checkMissionValidity($cart);

        return redirect()->back()->with('success', 'Cart updated successfully.');
    }

    /**
     * Remove item from cart.
     */
    public function remove($productId)
    {
        $cart = Cart::getOrCreateCartForUser();
        
        $cartItem = CartItem::where('cart_id', $cart->cart_id)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            $product = $cartItem->product;
            $cartItem->delete();

            // Log remove from cart
            $this->logActivity('remove_from_cart', [
                'product_id' => $productId,
                'product_name' => $product ? $product->product_name : 'Unknown',
            ]);

            // Check if mission is still valid
            $this->checkMissionValidity($cart);
        }

        return redirect()->back()->with('success', 'Item removed from cart.');
    }

    /**
     * Check if the current cart still satisfies the mission requirements.
     * If not, remove the mission_id from the cart.
     */
    private function checkMissionValidity(Cart $cart)
    {
        if (!$cart->mission_id) {
            return;
        }

        $mission = \App\Models\Mission::find($cart->mission_id);
        if (!$mission) {
            $cart->update(['mission_id' => null]);
            return;
        }

        // Reload items to get current count
        $cart->load('items');
        
        // Count mission items
        $missionItemCount = $cart->items->filter(function ($item) {
            return (bool) $item->is_mission_item;
        })->count();
        
        $requiredSlots = $mission->slots()->count();

        if ($missionItemCount < $requiredSlots) {
            $cart->update(['mission_id' => null]);
        }
    }
}
