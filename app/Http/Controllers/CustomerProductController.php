<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class CustomerProductController extends Controller
{
    /**
     * Display categories or products based on request
     */
    /**
     * Display the categories page
     */
    public function index(Request $request): Response
    {
        $categories = Category::query()
            ->active()
            ->ordered()
            ->withCount('products')
            ->get();

        return Inertia::render('Products/Categories', [
            'categories' => $categories,
            'selectedCategory' => $request->category ?? null,
        ]);
    }

    /**
     * Display the product list page
     */
    public function productList(Request $request): Response
    {
        $categories = Category::query()
            ->active()
            ->ordered()
            ->withCount('products')
            ->get();

        $products = Product::query()
            ->with(['category', 'images' => function($query) {
                $query->primary();
            }])
            ->active()
            ->when($request->category, function($query, $categorySlug) {
                $query->whereHas('category', function($q) use ($categorySlug) {
                    $q->where('slug', $categorySlug);
                });
            })
            ->when($request->search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        // Attach sold_count for each product (sum of quantities from delivered orders)
        $productIds = $products->pluck('product_id')->filter()->all();
        if (!empty($productIds)) {
            $soldMap = \App\Models\OrderItem::query()
                ->whereIn('product_id', $productIds)
                ->whereHas('order', function ($q) {
                    $q->where('order_status', \App\Models\Order::STATUS_DELIVERED);
                })
                ->select('product_id', DB::raw('SUM(quantity) as sold'))
                ->groupBy('product_id')
                ->get()
                ->pluck('sold', 'product_id')
                ->all();

            foreach ($products as $p) {
                $p->sold_count = isset($soldMap[$p->product_id]) ? (int) $soldMap[$p->product_id] : 0;
            }
        }

        $categories = Category::query()
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('Products/ProductList', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategory' => $request->category,
            'filters' => $request->only(['search', 'category'])
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product): Response
    {
        // Load relations and all approved reviews (for filtering and counts)
        $product->load(['category', 'images']);

        $reviews = $product->reviews()->with(['user', 'images'])
            ->latest()
            ->get();

        // Expose whether the current authenticated user has this product in their wishlist
        $product->in_wishlist = false;
        if (auth()->check()) {
            $product->in_wishlist = \App\Models\Wishlist::where('user_id', auth()->id())
                ->where('product_id', $product->product_id)
                ->exists();
        }

        // Can the authenticated user write a review? Only allow if they have a delivered order containing this product
        $product->can_review = false;
        $product->user_review = null;
        if (auth()->check()) {
            $userId = auth()->id();
            $hasDelivered = \App\Models\Order::where('user_id', $userId)
                ->where('order_status', \App\Models\Order::STATUS_DELIVERED)
                ->whereHas('items', function($q) use ($product) {
                    $q->where('product_id', $product->product_id);
                })->exists();

            $existingReview = \App\Models\Review::where('user_id', $userId)
                ->where('product_id', $product->product_id)
                ->first();

            $product->can_review = $hasDelivered && !$existingReview;
            $product->user_review = $existingReview;
        }

        // Calculate sold count (sum quantities of delivered orders)
        $soldCount = \App\Models\OrderItem::where('product_id', $product->product_id)
            ->whereHas('order', function($q) {
                $q->where('order_status', \App\Models\Order::STATUS_DELIVERED);
            })->sum('quantity');

        // Prepare rating counts for filters (1..5)
        $ratingCounts = $product->reviews()
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->all();

        // Ensure keys 1..5 exist
        $ratingCounts = array_replace(array_fill(1,5,0), $ratingCounts);

        return Inertia::render('Products/Show', [
            'product' => $product,
            'reviews' => $reviews,
            'can_review' => $product->can_review,
            'user_review' => $product->user_review,
            'sold_count' => (int) $soldCount,
            'rating_counts' => $ratingCounts,
        ]);
    }
}