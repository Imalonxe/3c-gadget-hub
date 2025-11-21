<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
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

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'subtotal' => $subtotal
        ]);
    }

    /**
     * Add item to cart.
     */
    public function add(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

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

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['message' => 'Item added to cart successfully.']);
        }

        return redirect()->back()->with('success', 'Item added to cart successfully.');
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

        return redirect()->back()->with('success', 'Cart updated successfully.');
    }

    /**
     * Remove item from cart.
     */
    public function remove($productId)
    {
        $cart = Cart::getOrCreateCartForUser();
        
        CartItem::where('cart_id', $cart->cart_id)
            ->where('product_id', $productId)
            ->delete();

        return redirect()->back()->with('success', 'Item removed from cart.');
    }
}
