<?php
require __DIR__.'/vendor/autoload.php';
putenv('APP_ENV=testing');
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    // Clean up previous test data
    \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    \App\Models\OrderItem::truncate();
    \App\Models\Order::truncate();
    \App\Models\Coupon::truncate();
    \App\Models\User::truncate();
    \App\Models\Product::truncate();
    \App\Models\ShippingProvider::truncate();
    \App\Models\Cart::truncate();
    \App\Models\CartItem::truncate();
    \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

    echo "Checkpoint 1: Cleanup done\n";

    $user = \App\Models\User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
        'email_verified_at' => now(),
    ]);
    auth()->login($user);
    echo "Checkpoint 2: User created (ID: {$user->id})\n";

    $coupon = \App\Models\Coupon::create([
        'code' => 'TEST50',
        'name' => 'Test Coupon',
        'type' => 'fixed',
        'value' => 50,
        'min_order_amount' => 0,
        'is_active' => true,
    ]);
    echo "Checkpoint 3: Coupon created\n";

    $category = \App\Models\Category::first();
    if (!$category) {
        $category = \App\Models\Category::create(['category_name' => 'Test Cat', 'slug' => 'test-cat', 'sort_order' => 1]);
    }

    $product = \App\Models\Product::create([
        'product_name' => 'Test Product',
        'slug' => 'test-product',
        'price' => 200,
        'stock_quantity' => 10,
        'is_active' => true,
        'category_id' => $category->category_id
    ]);
    echo "Checkpoint 4: Product created\n";

    $shippingProvider = \App\Models\ShippingProvider::create([
        'name' => 'Test Provider',
        'code' => 'TEST_PROV',
        'base_fee' => 50,
        'is_active' => true,
        'sort_order' => 1
    ]);
    echo "Checkpoint 5: ShippingProvider created\n";

    // Create cart manually
    $cart = \App\Models\Cart::create(['user_id' => $user->id]);
    \App\Models\CartItem::create([
        'cart_id' => $cart->cart_id,
        'product_id' => $product->product_id,
        'quantity' => 1,
        'price_at_add' => 200
    ]);
    echo "Checkpoint 6: Cart created\n";

    // Mock EnsureEmailIsVerified middleware to bypass check
    app()->instance(\App\Http\Middleware\EnsureEmailIsVerified::class, new class {
        public function handle($request, $next) { return $next($request); }
    });

    echo "Submitting checkout...\n";
    $response = app()->handle(\Illuminate\Http\Request::create('/checkout', 'POST', [
        'shipping_address' => [
            'full_name' => 'Test User',
            'phone' => '123',
            'address' => '123 St',
            'city' => 'City',
            'postal_code' => '12345'
        ],
        'payment_method' => 'cod',
        'shipping_provider_id' => $shippingProvider->id,
        'coupon_code' => 'TEST50',
        'discount_amount' => 50,
        'save_address' => false
    ]));

    echo "Status: " . $response->getStatusCode() . "\n";
    if ($response->headers->has('Location')) {
        echo "Redirect Location: " . $response->headers->get('Location') . "\n";
    }
    
    if ($response->getSession() && $response->getSession()->has('errors')) {
        echo "Session Errors: " . json_encode($response->getSession()->get('errors')->all()) . "\n";
    }

    if ($response->getStatusCode() == 302) {
        $order = \App\Models\Order::where('user_id', $user->id)->latest('order_id')->first();
        echo "Order Created: " . ($order ? 'Yes' : 'No') . "\n";
        if ($order) {
            echo "Order Coupon ID: " . $order->coupon_id . "\n";
            echo "Expected Coupon ID: " . $coupon->id . "\n";
            
            if ($order->coupon_id == $coupon->id) {
                echo "SUCCESS: Order linked to coupon.\n";
            } else {
                echo "FAILURE: Order NOT linked to coupon.\n";
            }

            // Verify analytics logic
            $coupon->refresh();
            $coupon->load('orders');
            $totalDiscount = $coupon->orders->sum('discount');
            echo "Total Discount from Analytics Logic: " . $totalDiscount . "\n";
            
            if ($totalDiscount == 50) {
                echo "SUCCESS: Analytics calculation correct.\n";
            } else {
                echo "FAILURE: Analytics calculation incorrect. Expected 50, got " . $totalDiscount . "\n";
            }
        }
    } else {
        echo "Error Content: " . substr($response->getContent(), 0, 500) . "\n";
    }

} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
exit;
