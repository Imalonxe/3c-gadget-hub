<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use App\Http\Requests\StoreCouponRequest;
use App\Http\Requests\UpdateCouponRequest;
use App\Models\Category;
use App\Models\Order;

class CouponController extends Controller
{
    /**
     * Display a listing of the coupons.
     */
    public function index()
    {
        $coupons = Coupon::with('category')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons
        ]);
    }

    /**
     * Show the form for creating a new coupon.
     */
    public function create()
    {
        return Inertia::render('Admin/Coupons/Create');
    }

    /**
     * Store a newly created coupon in storage.
     */
    public function store(StoreCouponRequest $request)
    {
        $coupon = Coupon::create($request->validated());

        return redirect()->route('admin.coupons.index')
            ->with('success', 'Coupon created successfully.');
    }

    /**
     * Show the form for editing the specified coupon.
     */
    public function edit(Coupon $coupon)
    {
        // Load relationships needed for the edit form
        $coupon->load('category');

        // Provide categories for selection in the edit form
        $categories = Category::ordered()->get(['category_id', 'category_name']);

        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => $coupon,
            'categories' => $categories,
        ]);
    }

    /**
     * Display the specified coupon (details view).
     */
    public function show(Coupon $coupon)
    {
        // Load related data: always load category and users. Orders are optional
        // and depend on whether the orders table contains a coupon_id column.
        $hasOrdersColumn = Schema::hasColumn('orders', 'coupon_id');

        if ($hasOrdersColumn) {
            $coupon->load('category', 'orders', 'users');

            // Calculate analytics data from orders
            $coupon->total_discount_amount = $coupon->orders->sum('discount_amount');
            $coupon->avg_order_value = $coupon->orders->avg('total_amount') ?? 0;

            // Calculate daily usage
            $dailyUsage = $coupon->orders
                ->groupBy(function ($order) {
                    return $order->created_at->format('Y-m-d');
                })
                ->map(function ($orders) {
                    return $orders->count();
                });

            $coupon->daily_usage = $dailyUsage;
        } else {
            // Orders table doesn't have coupon_id yet (older installations).
            // Provide safe defaults so the admin UI can still render.
            $coupon->load('category', 'users');
            $coupon->total_discount_amount = 0;
            $coupon->avg_order_value = 0;
            $coupon->daily_usage = collect([]);
        }

        // Prepare a simple list of claims (user info + claimed_at) for the frontend
        $claims = $coupon->users->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email ?? null,
                'claimed_at' => $u->pivot->created_at ?? null,
            ];
        })->values();

        return Inertia::render('Admin/Coupons/Show', [
            'coupon' => $coupon,
            'claims' => $claims,
        ]);
    }

    /**
     * Update the specified coupon in storage.
     */
    public function update(UpdateCouponRequest $request, Coupon $coupon)
    {
        $coupon->update($request->validated());

        return redirect()->route('admin.coupons.index')
            ->with('success', 'Coupon updated successfully.');
    }

    /**
     * Remove the specified coupon from storage.
     */
    public function destroy(Coupon $coupon)
    {
        $coupon->delete();

        return redirect()->route('admin.coupons.index')
            ->with('success', 'Coupon deleted successfully.');
    }

    /**
     * Bulk delete coupons.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:coupons,id'
        ]);

        Coupon::whereIn('id', $request->ids)->delete();

        return redirect()->route('admin.coupons.index')
            ->with('success', count($request->ids) . ' coupons deleted successfully.');
    }

    /**
     * Bulk update coupons.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:coupons,id',
            'data' => 'required|array',
            'data.is_active' => 'boolean'
        ]);

        Coupon::whereIn('id', $request->ids)
            ->update($request->data);

        $action = $request->data['is_active'] ? 'activated' : 'deactivated';
        return redirect()->route('admin.coupons.index')
            ->with('success', count($request->ids) . " coupons {$action} successfully.");
    }

    /**
     * Validate a coupon code.
     */
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,category_id',
            'intent' => 'nullable|in:claim,apply'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();
        $intent = $request->input('intent', 'apply');
        $shouldAttachToLibrary = $intent === 'claim';

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid coupon code.'
            ]);
        }

        if (!$coupon->isValid()) {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon is no longer valid.'
            ]);
        }

        // Determine discount for subtotal. Some coupon types (eg. free_shipping)
        // don't return a monetary discount on the subtotal but are still valid.
        $discount = $coupon->calculateDiscount(
            $request->subtotal,
            $request->category_id
        );

        // If coupon type is free_shipping then allow it even if discount is zero.
        if ($discount === 0 && $coupon->type !== 'free_shipping') {
            return response()->json([
                'valid' => false,
                'message' => 'This coupon cannot be applied to your order.'
            ]);
        }
        // Persist this coupon into the user's library so they can reuse it later.
        // Claiming (entering the code) is different from using it in an order.
        // Enforce one-claim-per-account: if the user already claimed/saved this
        // coupon (exists in coupon_user pivot), reject the claim.
        if ($request->user() && $shouldAttachToLibrary) {
            try {
                $user = $request->user();

                // If the user already saved/claimed this coupon, only block when
                // the client explicitly intends to 'claim' the coupon. We must
                // allow validation/apply calls (e.g. selecting a saved coupon in
                // checkout) to proceed even if the coupon is already in the
                // user's library.
                $alreadyClaimed = $user->coupons()->where('coupon_id', $coupon->id)->exists();
                if ($alreadyClaimed) {
                    return response()->json([
                        'valid' => false,
                        'message' => 'You have already claimed this coupon.',
                    ]);
                }

                // Additionally, if the pivot records that this coupon was already
                // used by this user (used=true), block further claims/applies and
                // tell the user that they've already used it.
                $alreadyUsed = false;
                if (\Illuminate\Support\Facades\Schema::hasColumn('coupon_user', 'used')) {
                    try {
                        $alreadyUsed = $user->coupons()
                            ->where('coupons.id', $coupon->id)
                            ->wherePivot('used', true)
                            ->exists();
                    } catch (\Exception $e) {
                        // In case where wherePivot isn't supported due to Laravel version,
                        // fallback to joining the pivot table directly.
                        $alreadyUsed = \DB::table('coupon_user')
                            ->where('user_id', $user->id)
                            ->where('coupon_id', $coupon->id)
                            ->where('used', true)
                            ->exists();
                    }

                    if ($alreadyUsed) {
                        return response()->json([
                            'valid' => false,
                            'message' => 'You have already used this coupon.'
                        ]);
                    }
                }

                // Otherwise attach to the user's library
                $user->coupons()->syncWithoutDetaching([$coupon->id]);
                // Log successful attach for debugging
                \Log::info('Coupon attached to user library', [
                    'user_id' => $request->user()->id,
                    'coupon_id' => $coupon->id,
                    'code' => $coupon->code
                ]);
                // Create an activity log entry for applying the coupon
                try {
                    $payload = [
                        'user_id' => $request->user()->id,
                        'action' => 'apply_coupon',
                        'url' => $request->fullUrl(),
                        'method' => $request->method(),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->header('User-Agent'),
                        'meta' => [
                            'route' => $request->route() ? $request->route()->getName() : null,
                            'coupon_id' => $coupon->id,
                            'code' => $coupon->code,
                            'discount' => $discount,
                        ],
                    ];

                    if (config('activity-logs.queue_write', true)) {
                        dispatch(new \App\Jobs\WriteActivityLog($payload));
                    } else {
                        \App\Models\ActivityLog::create($payload);
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to write activity log for coupon apply: ' . $e->getMessage());
                }
            } catch (\Exception $e) {
                // Non-fatal; just log it
                \Log::warning('Failed to attach coupon to user library: ' . $e->getMessage());
            }
        }

        $response = [
            'valid' => true,
            'discount' => $discount,
            'message' => 'Coupon applied successfully.'
        ];

        if ($coupon->type === 'free_shipping') {
            // Signal the frontend to zero the shipping amount
            $response['free_shipping'] = true;
        }

        return response()->json($response);
    }

    /**
     * Show all available coupons to users (public library)
     */
    public function all()
    {
        // If a user is authenticated, show only the coupons they've saved/claimed.
        // Otherwise show public valid coupons.
        if (auth()->check()) {
            $query = auth()->user()->coupons();

            // If pivot has a 'used' flag, only show coupons that are not used.
            if (\Illuminate\Support\Facades\Schema::hasColumn('coupon_user', 'used')) {
                try {
                    $query = $query->wherePivot('used', false);
                } catch (\Exception $e) {
                    // ignore and fallback to filtering after load
                }
            }

            $coupons = $query->valid()->orderBy('created_at', 'desc')->paginate(12);
            // Fallback: if wherePivot didn't work above, filter used coupons out in PHP
            if (\Illuminate\Support\Facades\Schema::hasColumn('coupon_user', 'used') && $coupons->count()) {
                $filtered = $coupons->filter(function ($c) {
                    return isset($c->pivot) ? (!isset($c->pivot->used) || !$c->pivot->used) : true;
                });
                // Re-paginate simple fallback (not perfect but keeps UI consistent)
                $coupons->setCollection($filtered->values());
            }
        } else {
            $coupons = Coupon::valid()->orderBy('created_at', 'desc')->paginate(12);
        }

        return Inertia::render('User/Coupons/Library', [
            'coupons' => $coupons
        ]);
    }

    /**
     * Return public valid coupons as JSON for client-side listing/claiming.
     */
    public function publicJson()
    {
        // If user is authenticated, return their saved (and unused) coupons.
        if (auth()->check()) {
            $query = auth()->user()->coupons();
            if (\Illuminate\Support\Facades\Schema::hasColumn('coupon_user', 'used')) {
                try {
                    $query = $query->wherePivot('used', false);
                } catch (\Exception $e) {
                    // ignore and fallback to PHP filtering below
                }
            }

            $coupons = $query->valid()->orderBy('created_at', 'desc')->get();

            if (\Illuminate\Support\Facades\Schema::hasColumn('coupon_user', 'used')) {
                $coupons = $coupons->filter(function ($c) {
                    return isset($c->pivot) ? (!isset($c->pivot->used) || !$c->pivot->used) : true;
                })->values();
            }

            return response()->json(['coupons' => $coupons]);
        }

        $coupons = Coupon::valid()->orderBy('created_at', 'desc')->get();
        return response()->json(['coupons' => $coupons]);
    }
}