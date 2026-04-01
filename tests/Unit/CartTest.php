<?php

namespace Tests\Unit;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_or_create_cart_creates_new_cart_for_user()
    {
        $user = User::factory()->create();

        $cart = Cart::getOrCreateCartForUser($user);

        $this->assertNotNull($cart);
        $this->assertEquals($user->id, $cart->user_id);
    }

    public function test_get_or_create_cart_returns_existing_cart_for_user()
    {
        $user = User::factory()->create();
        $existingCart = Cart::create(['user_id' => $user->id]);

        $cart = Cart::getOrCreateCartForUser($user);

        $this->assertEquals($existingCart->cart_id, $cart->cart_id);
    }

    public function test_add_item_adds_new_item_to_cart()
    {
        $cart = Cart::factory()->create();
        $product = Product::factory()->create();

        $cart->addItem($product, 2);

        $this->assertCount(1, $cart->items);
        $this->assertEquals($product->product_id, $cart->items->first()->product_id);
        $this->assertEquals(2, $cart->items->first()->quantity);
    }

    public function test_add_item_updates_quantity_for_existing_item()
    {
        $cart = Cart::factory()->create();
        $product = Product::factory()->create();
        
        // Add first time
        $cart->addItem($product, 1);
        
        // Add second time
        $cart->addItem($product, 2);

        $this->assertCount(1, $cart->items);
        $this->assertEquals(3, $cart->items->first()->quantity);
    }

    public function test_remove_item_removes_item_from_cart()
    {
        $cart = Cart::factory()->create();
        $product = Product::factory()->create();
        $cart->addItem($product, 1);

        $cart->removeItem($product->product_id);

        $this->assertCount(0, $cart->items);
    }

    public function test_clear_removes_all_items_from_cart()
    {
        $cart = Cart::factory()->create();
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();

        $cart->addItem($product1, 1);
        $cart->addItem($product2, 1);

        $cart->clear();

        $this->assertCount(0, $cart->items);
    }

    public function test_update_quantity_updates_item_quantity()
    {
        $cart = Cart::factory()->create();
        $product = Product::factory()->create();
        $cart->addItem($product, 1);

        $cart->updateQuantity($product->product_id, 5);

        $this->assertEquals(5, $cart->items->first()->quantity);
    }

    public function test_total_calculates_correct_cart_total()
    {
        $cart = Cart::factory()->create();
        $product1 = Product::factory()->create(['price' => 100]);
        $product2 = Product::factory()->create(['price' => 50]);

        $cart->addItem($product1, 2); // 200
        $cart->addItem($product2, 1); // 50

        $this->assertEquals(250, $cart->total());
    }
}
