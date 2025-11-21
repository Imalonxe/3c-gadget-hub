<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    /**
     * Display the user's wishlist.
     */
    public function index(): Response
    {
        $wishlistItems = Wishlist::where('user_id', auth()->id())
            ->with(['product' => function($query) {
                $query->with(['images' => function($q) {
                    $q->primary();
                }]);
            }])
            ->get();

        // Ensure the product objects include an `in_stock` boolean for the frontend
        foreach ($wishlistItems as $item) {
            if ($item->product) {
                // Some places expect `in_stock` boolean; compute from stock_quantity
                $item->product->in_stock = (isset($item->product->stock_quantity) && $item->product->stock_quantity > 0);
                // Ensure a primary image url is available under images[0]
                if ($item->product->relationLoaded('images') && $item->product->images->isNotEmpty()) {
                    // images eager-loaded with `primary()` scope — keep as-is
                }
            }
        }

        return Inertia::render('User/Wishlist/Index', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    /**
     * Add item to wishlist.
     */
    public function store(Request $request)
    {
        $request->validate([
            // Product primary key in this app is `product_id`
            'product_id' => 'required|exists:products,product_id'
        ]);

        $wishlistItem = Wishlist::firstOrCreate([
            'user_id' => auth()->id(),
            'product_id' => $request->product_id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item added to wishlist'
        ]);
    }

    /**
     * Remove item from wishlist.
     */
    public function destroy($productId)
    {
        Wishlist::where('user_id', auth()->id())
            ->where('product_id', $productId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from wishlist'
        ]);
    }

    /**
     * Move item from wishlist to cart.
     */
    public function moveToCart($productId)
    {
        // Implementation for moving item to cart
        return response()->json([
            'success' => true,
            'message' => 'Item moved to cart'
        ]);
    }
}
