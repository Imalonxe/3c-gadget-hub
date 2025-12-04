<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Traits\LogsActivity;

class LoadoutController extends Controller
{
    use LogsActivity;

    public function index(Request $request)
    {
        // Determine A/B Group
        $abGroup = 'A'; // Default
        if (auth()->check()) {
            // Consistent assignment based on User ID
            $abGroup = (auth()->id() % 2 == 0) ? 'A' : 'B';
        } else {
            // Random assignment for guests, stored in session
            if (!$request->session()->has('ab_group')) {
                $request->session()->put('ab_group', rand(0, 1) == 0 ? 'A' : 'B');
                $request->session()->save();
            }
            $abGroup = $request->session()->get('ab_group');
        }

        $missions = Mission::where('status', true)
            ->where(function ($query) {
                $query->whereNull('start_date')
                      ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->when(!auth()->check() || !auth()->user()->isAdmin(), function ($query) use ($abGroup) {
                $query->where(function ($q) use ($abGroup) {
                    $q->where('ab_group', 'none')
                      ->orWhere('ab_group', $abGroup);
                });
            })
            ->with('slots.category')
            ->get();
        return Inertia::render('Loadout/Index', [
            'missions' => $missions,
        ]);
    }

    public function show(Mission $mission)
    {
        if (!$mission->status) {
            abort(404);
        }

        // Track View
        \App\Models\MissionAnalytics::firstOrCreate(
            ['mission_id' => $mission->id, 'date' => now()->toDateString()],
            ['views' => 0, 'completions' => 0, 'revenue' => 0]
        )->increment('views');

        $mission->load('slots.category');

        $slotsData = $mission->slots->map(function ($slot) {
            return [
                'id' => $slot->id,
                'category_name' => $slot->category->category_name,
                'products' => Product::where('category_id', $slot->category_id)
                    ->where('stock_quantity', '>', 0)
                    ->with('images')
                    ->select('product_id', 'product_name', 'price', 'sale_price')
                    ->get()
                    ->map(function ($product) {
                        return [
                            'id' => $product->product_id,
                            'name' => $product->product_name,
                            'price' => $product->price,
                            'sale_price' => $product->sale_price,
                            'image' => $product->images->first()->image_url ?? null,
                        ];
                    }),
            ];
        });

        return Inertia::render('Loadout/Builder', [
            'mission' => $mission,
            'slotsData' => $slotsData,
        ]);
    }

    public function addToCart(Request $request, Mission $mission)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*' => 'required|exists:products,product_id',
        ]);

        // Verify all slots are filled (basic validation)
        if (count($request->items) !== $mission->slots()->count()) {
            return back()->with('error', 'Please fill all slots to complete the mission.');
        }

        $cart = Cart::getOrCreateCartForUser();
        
        // Clear existing items to ensure only mission items are present (and discounted)
        $cart->items()->delete();

        // Link mission to cart
        $cart->update(['mission_id' => $mission->id]);

        // Add items to cart
        foreach ($request->items as $productId) {
            $cart->addItem($productId, 1, true);
        }

        // Track Completion
        \App\Models\MissionAnalytics::firstOrCreate(
            ['mission_id' => $mission->id, 'date' => now()->toDateString()],
            ['views' => 0, 'completions' => 0, 'revenue' => 0]
        )->increment('completions');

        $this->logActivity('loadout_add_to_cart', [
            'mission_id' => $mission->id,
            'mission_name' => $mission->name,
            'items_count' => count($request->items)
        ]);

        return redirect()->route('checkout.index');
    }
}
