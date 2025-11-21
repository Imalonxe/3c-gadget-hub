<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\Setting;
use DB;
use App\Jobs\WriteActivityLog;
use App\Models\Coupon;
use Illuminate\Support\Facades\Schema;

class CheckoutController extends Controller
{
    /**
     * Show the checkout page.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        // Support "Buy Now" flow: if `buy_now=1` and product & quantity are provided
        // then build a synthetic cartItems collection containing only that product.
        if ($request->query('buy_now')) {
            $productId = $request->query('product');
            $quantity = max(1, (int) $request->query('quantity', 1));

            $product = Product::with(['images'])->find($productId);

            if (!$product) {
                return redirect()->route('products.index')->with('error', 'Product not found.');
            }

            // Build a simple collection similar to CartItem shape expected by the view
            $cartItems = collect([ (object) [
                'cart_item_id' => null,
                'product_id' => $product->product_id ?? $product->id,
                'quantity' => $quantity,
                'price_at_add' => $product->sale_price ?? $product->price,
                'product' => $product
            ]]);
        } else {
            $cart = Cart::getOrCreateCartForUser();
            
            $cartItems = CartItem::where('cart_id', $cart->cart_id)
                ->with(['product' => function($query) {
                    $query->with(['images']);
                }])
                ->get();

            if ($cartItems->isEmpty()) {
                return redirect()->route('cart.index')
                    ->with('error', 'Your cart is empty.');
            }
        }

        $subtotal = $cartItems->sum(function($item) {
            return $item->quantity * $item->price_at_add;
        });

        $tax = $subtotal * 0.07; // 7% VAT
        $shipping = 50.00; // Fixed shipping fee
        $total = $subtotal + $tax + $shipping;

        // Load user's saved coupons so checkout can offer a selector
        $userCoupons = collect();
        if (auth()->check()) {
            // If the coupon_user pivot includes a 'used' flag, only surface
            // coupons that are not yet used (used = false). This prevents
            // already-consumed coupons from appearing in the checkout selector.
            $query = auth()->user()->coupons();
            if (Schema::hasColumn('coupon_user', 'used')) {
                try {
                    $query = $query->wherePivot('used', false);
                } catch (\Exception $e) {
                    // Fallback: filter in PHP after loading if wherePivot isn't available
                }
            }

            $userCoupons = $query->valid()->get();

            // Log for debugging: how many coupons were loaded for this user
            \Log::info('Checkout loaded user coupons', [
                'user_id' => auth()->id(),
                'coupons_count' => $userCoupons->count(),
                'coupon_ids' => $userCoupons->pluck('id')->toArray()
            ]);
        }

        // For privacy and to avoid confusion, only surface coupons that the user
        // has explicitly saved/claimed in the checkout flow. Public coupons remain
        // discoverable via the coupons library page (`CouponController::all`) and
        // users can claim them by validating a code (which persists them to their
        // library via `validateCoupon`). Avoid exposing admin-created public coupons
        // in the checkout select by default.
        $availableCoupons = $userCoupons;

        // Provide user's saved addresses to the checkout page so the frontend
        // can offer a "use saved address" selector and prefill the form.
        $userAddresses = collect();
        if (auth()->check()) {
            $userAddresses = auth()->user()->addresses()->get();
        }

        return Inertia::render('Checkout/Index', [
            'cartItems' => $cartItems,
            'summary' => [
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total
            ],
            // Frontend expects a `coupons` array; pass only the relevant set so
            // coupons aren't mistaken for user-owned coupons.
            'coupons' => $availableCoupons,
            'buy_now' => (bool) $request->query('buy_now'),
            'buy_now_product' => $request->query('product'),
            'buy_now_quantity' => (int) $request->query('quantity', 1),
            // Pass configured PromptPay phone/id so frontend can hide demo label when configured
            'promptpay_phone' => Setting::get('promptpay_phone', env('PROMPTPAY_ID')),
            'addresses' => $userAddresses,
        ]);
    }

    /**
     * Process the checkout.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Debug: Log incoming request data
        \Log::info('Checkout Request Data:', $request->all());
        
        $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string',
            'shipping_address.phone' => 'required|string',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'payment_method' => 'required|in:cod,bank_transfer,promptpay',
            'notes' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'free_shipping' => 'nullable|boolean'
        ]);

        try {
            DB::beginTransaction();
            
            // Log for debugging
            \Log::info('Starting checkout process', [
                'user_id' => auth()->id(),
                'payment_method' => $request->payment_method
            ]);

            // Determine whether this is a normal cart checkout or a Buy Now single-product checkout.
            $cartItems = collect();
            if ($request->input('buy_now')) {
                $productId = $request->input('product');
                $quantity = max(1, (int) $request->input('quantity', 1));
                $product = Product::find($productId);
                if (!$product) {
                    throw new \Exception('Product not found');
                }

                $cartItems = collect([ (object) [
                    'cart_item_id' => null,
                    'product_id' => $product->product_id ?? $product->id,
                    'quantity' => $quantity,
                    'price_at_add' => $product->sale_price ?? $product->price,
                    'product' => $product
                ]]);
            } else {
                // Get items from user's cart
                $cart = Cart::getOrCreateCartForUser();
                $cartItems = CartItem::where('cart_id', $cart->cart_id)
                    ->with('product')
                    ->get();

                if ($cartItems->isEmpty()) {
                    throw new \Exception('Cart is empty');
                }
            }

            // Check stock availability
            foreach ($cartItems as $item) {
                if ($item->product->stock_quantity < $item->quantity) {
                    throw new \Exception("Insufficient stock for {$item->product->product_name}");
                }
            }

            // Calculate totals
            $subtotal = $cartItems->sum(function($item) {
                return $item->quantity * $item->price_at_add;
            });

            // Read discount sent from frontend (validated earlier when coupon was applied)
            // fall back to 0 if not provided
            $discountAmount = (float) $request->input('discount_amount', 0);
            if ($discountAmount < 0) {
                $discountAmount = 0;
            }

            // Determine if frontend requested free shipping (set by coupon validate)
            $freeShipping = (bool) $request->input('free_shipping', false);

            // Apply discount to subtotal (never below zero)
            $subtotalAfterDiscount = max(0, $subtotal - $discountAmount);

            // Calculate tax on the discounted subtotal (7% VAT)
            $tax = $subtotalAfterDiscount * 0.07;

            // Shipping fee is 0 when freeShipping coupon applied
            $shipping = $freeShipping ? 0.00 : 50.00;

            // Final total = discounted subtotal + tax + shipping
            $total = $subtotalAfterDiscount + $tax + $shipping;

            // If a coupon code was provided, resolve it now so we can attach it to the order later
            $appliedCoupon = null;
            if ($request->filled('coupon_code')) {
                $appliedCoupon = Coupon::where('code', $request->input('coupon_code'))->first();
            }

            // Create order
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'order_status' => Order::STATUS_PENDING_PAYMENT,
                'payment_status' => Order::PAYMENT_PENDING,
                'payment_method' => $request->payment_method,
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping,
                'tax' => $tax,
                // Persist discount so it's visible on order and used by other logic
                'discount' => $discountAmount,
                'total_amount' => $total,
                'notes' => $request->notes
            ]);

            // If a coupon was applied, persist relation and increment usage where supported
            if ($appliedCoupon) {
                try {
                    // If orders table contains coupon_id, set it for this order
                    if (Schema::hasColumn('orders', 'coupon_id')) {
                        $order->coupon_id = $appliedCoupon->id;
                        $order->save();
                    }

                    // Increment coupon used_count atomically
                    $appliedCoupon->incrementUsage();

                    // If the user had this coupon in their saved library (coupon_user pivot),
                    // mark it as used instead of detaching so we retain historical claim data
                    // and prevent the user from claiming it again.
                    try {
                        if (auth()->check()) {
                            $user = auth()->user();
                            if (Schema::hasColumn('coupon_user', 'used')) {
                                $user->coupons()->updateExistingPivot($appliedCoupon->id, [
                                    'used' => true,
                                    'used_at' => now()
                                ]);
                            } else {
                                // Older installations without the `used` pivot column will
                                // continue to detach (best-effort) — recommended to run migration.
                                $user->coupons()->detach($appliedCoupon->id);
                            }
                        }
                    } catch (\Exception $e) {
                        // Non-fatal: log and continue
                        \Log::warning('Failed to mark used coupon on pivot: ' . $e->getMessage());
                    }
                } catch (\Exception $e) {
                    // Non-fatal: log and continue
                    \Log::warning('Failed to attach/increment coupon usage on order: ' . $e->getMessage());
                }
            }

            // Persist shipping address and attach to order
            $addr = $request->input('shipping_address', []);

            // If frontend provided an existing address id, prefer that saved address
            $address = null;
            if (!empty($addr['address_id'])) {
                $existing = \App\Models\Address::where('address_id', $addr['address_id'])->first();
                if ($existing && $existing->user_id === auth()->id()) {
                    $address = $existing;
                }
            }

            if (!$address) {
                $address = \App\Models\Address::create([
                    'user_id' => auth()->id(),
                    'address_type' => 'shipping',
                    'recipient_name' => $addr['full_name'] ?? null,
                    'phone' => $addr['phone'] ?? null,
                    'address_line1' => $addr['address'] ?? ($addr['address_line1'] ?? null),
                    'address_line2' => $addr['address_line2'] ?? null,
                    'district' => $addr['city'] ?? null,
                    'province' => $addr['province'] ?? ($addr['city'] ?? null),
                    'postal_code' => $addr['postal_code'] ?? null,
                    'is_default' => false,
                ]);
            }

            // Link address to order (orders.shipping_address_id references addresses.address_id)
            $order->shipping_address_id = $address->address_id;
            $order->save();

            // Create order items and update stock
            foreach ($cartItems as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->price_at_add,
                    'subtotal' => $item->quantity * $item->price_at_add,
                    'product_name' => $item->product->product_name,
                    'product_sku' => $item->product->sku
                ]);

                // Update product stock
                $item->product->decrement('stock_quantity', $item->quantity);
            }

            // Clear cart only for normal cart checkout (do not clear for Buy Now)
            if (!$request->input('buy_now')) {
                CartItem::where('cart_id', $cart->cart_id)->delete();
            }

            DB::commit();

            \Log::info('Order created successfully:', ['order_id' => $order->order_id, 'payment_method' => $request->payment_method]);

            // Log for debugging
            \Log::info('Order created successfully', [
                'order_id' => $order->order_id,
                'payment_method' => $request->payment_method
            ]);

            // Activity log: record an explicit purchase/order_created action so audits show purchases
            try {
                $user = auth()->user();
                $itemsMeta = $order->items->map(function($it) {
                    return [
                        'product_id' => $it->product_id,
                        'product_name' => $it->product_name,
                        'quantity' => $it->quantity,
                        'unit_price' => $it->unit_price,
                    ];
                })->toArray();

                $payload = [
                    'user_id' => $user ? $user->id : null,
                    'action' => 'order_created',
                    'url' => $request->header('Referer') ?: route('checkout.success', ['order' => $order->order_id]),
                    'method' => $request->method(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->header('User-Agent'),
                    'meta' => [
                        'order_id' => $order->order_id,
                        'order_number' => $order->order_number,
                        'total' => $order->total_amount,
                        'payment_method' => $order->payment_method,
                        'items' => $itemsMeta,
                    ],
                ];

                if (config('activity-logs.queue_write', true)) {
                    dispatch(new WriteActivityLog($payload));
                } else {
                    \App\Models\ActivityLog::create($payload);
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to write activity log for order: '.$e->getMessage());
            }

            // Return proper Inertia redirect with order data
            // If payment requires a manual verification flow (bank transfer or PromptPay),
            // redirect the user to the payment page where a QR or bank details are shown
            // and where they can upload a slip for verification.
            if (in_array($request->payment_method, ['bank_transfer', 'promptpay'])) {
                return to_route('payment.show', ['order' => $order->order_id]);
            }

            return to_route('checkout.success', ['order' => $order->order_id]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Checkout error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors([
                'error' => 'Error processing order: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show the success page.
     */
    public function success(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        $order->load(['items.product', 'items.product.images' => function($query) {
                $query->primary();
            }, 'shippingAddress']);

        // Ensure the frontend expects `shipping_address` snake_case key
        if ($order->relationLoaded('shippingAddress')) {
            $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
        }

        return Inertia::render('Checkout/Success', [
            'order' => $order
        ]);
    }
}