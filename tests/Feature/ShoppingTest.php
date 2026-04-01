<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Cart;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShoppingTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_add_product_to_cart()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('cart.add', $product->product_id), [
                'quantity' => 1
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->product_id,
            'quantity' => 1
        ]);
    }

    public function test_user_can_view_cart()
    {
        $user = User::factory()->create();
        $cart = Cart::create(['user_id' => $user->id]);
        $product = Product::factory()->create();
        $cart->items()->create([
            'product_id' => $product->product_id,
            'quantity' => 1,
            'price_at_add' => $product->price
        ]);

        $response = $this->actingAs($user)
            ->get(route('cart.index'));

        $response->assertStatus(200);
        $response->assertSee($product->product_name);
    }

    public function test_user_can_place_order()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock_quantity' => 10, 'price' => 100]);
        $shippingProvider = \App\Models\ShippingProvider::create([
            'name' => 'Standard Delivery',
            'code' => 'standard',
            'base_fee' => 50,
            'is_active' => true
        ]);
        
        // Add to cart first
        $cart = Cart::create(['user_id' => $user->id]);
        $cart->items()->create([
            'product_id' => $product->product_id,
            'quantity' => 1,
            'price_at_add' => 100
        ]);

        $response = $this->actingAs($user)
            ->post(route('checkout.store'), [
                'shipping_address' => [
                    'full_name' => 'Test User',
                    'phone' => '0812345678',
                    'address' => '123 Test St',
                    'city' => 'Bangkok',
                    'province' => 'Bangkok',
                    'postal_code' => '10110',
                ],
                'payment_method' => 'cod',
                'shipping_provider_id' => $shippingProvider->id,
                'items' => [
                    [
                        'product_id' => $product->product_id,
                        'quantity' => 1,
                        'price' => 100
                    ]
                ]
            ]);

        $response->assertRedirect();
        
        // Subtotal: 100
        // Tax: 100 * 0.07 = 7
        // Shipping: 50
        // Total: 157
        $order = \App\Models\Order::where('user_id', $user->id)->first();
        if (!$order) {
            \Illuminate\Support\Facades\Log::error('Order not found for user ' . $user->id);
        } else {
            if ($order->total_amount != 157) {
                 \Illuminate\Support\Facades\Log::error('Order total mismatch. Expected 157, got ' . $order->total_amount);
                 \Illuminate\Support\Facades\Log::error('Order details: ' . json_encode($order->toArray()));
            }
        }

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_amount' => 157
        ]);
        
        // Check stock decrement
        $this->assertEquals(9, $product->fresh()->stock_quantity);
    }
}
