<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    use LogsActivity;
    /**
     * Store a new review.
     */
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:100',
            'comment' => 'required|string|max:1000',
            'images' => 'sometimes|array|max:5',
            'images.*' => 'image|mimes:jpg,jpeg,png,gif,webp|max:2048'
        ]);

        // Check if user has purchased the product
        $hasVerifiedPurchase = Order::where('user_id', Auth::id())
            ->whereHas('items', function($query) use ($product) {
                $query->where('product_id', $product->product_id);
            })
            ->where('order_status', Order::STATUS_DELIVERED)
            ->exists();

        // Check if user has already reviewed this product
        $existingReview = Review::where('user_id', Auth::id())
            ->where('product_id', $product->product_id)
            ->exists();

        if ($existingReview) {
            return back()->with('error', 'You have already reviewed this product.');
        }

        DB::beginTransaction();
        try {
            $review = Review::create([
                'user_id' => Auth::id(),
                'product_id' => $product->product_id,
                'rating' => $request->rating,
                'title' => $request->title,
                'comment' => $request->comment,
                'is_verified_purchase' => $hasVerifiedPurchase,
                'is_approved' => !config('app.review_requires_approval') // Auto-approve if not required
            ]);

            // Handle review images (optional)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('reviews', 'public');
                    $review->images()->create([
                        'image_url' => $path,
                    ]);
                }
            }

            // Update product average rating
            $this->updateProductRating($product);

            // Log review creation
            $this->logActivity('create_review', [
                'product_id' => $product->product_id,
                'product_name' => $product->product_name,
                'review_id' => $review->review_id,
                'rating' => $request->rating,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            report($e);
            return back()->with('error', 'Failed to submit review.');
        }

        return back()->with('success', 'Review submitted successfully' . 
            (!$review->is_approved ? '. It will be visible after approval.' : '.')
        );
    }

    /**
     * Update an existing review.
     */
    public function update(Request $request, Review $review)
    {
        $this->authorize('update', $review);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:100',
            'comment' => 'required|string|max:1000'
        ]);

        $review->update([
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'is_approved' => !config('app.review_requires_approval')
        ]);

        // Update product average rating
        $this->updateProductRating($review->product);

        // Log review update
        $this->logActivity('update_review', [
            'review_id' => $review->review_id,
            'product_id' => $review->product_id,
            'rating' => $request->rating,
        ]);

        return back()->with('success', 'Review updated successfully' .
            (!$review->is_approved ? '. It will be visible after approval.' : '.')
        );
    }

    /**
     * Delete a review.
     */
    public function destroy(Review $review)
    {
        $this->authorize('delete', $review);

        $product = $review->product;
        $reviewId = $review->review_id;
        $review->delete();

        // Update product average rating
        $this->updateProductRating($product);

        // Log review deletion
        $this->logActivity('delete_review', [
            'review_id' => $reviewId,
            'product_id' => $product->product_id,
        ]);

        return back()->with('success', 'Review deleted successfully.');
    }

    /**
     * Update product's average rating.
     */
    private function updateProductRating(Product $product)
    {
        $averageRating = $product->reviews()
            ->approved()
            ->avg('rating');

        $product->update([
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $product->reviews()->approved()->count()
        ]);
    }
}