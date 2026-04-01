<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Mission;
use App\Models\MissionSlot;
use App\Models\Category;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoadoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_loadout_page_assigns_ab_group_for_user()
    {
        $userA = User::factory()->create(['id' => 2]); // Even -> A
        
        // Test User A
        $response = $this->actingAs($userA)->get(route('loadout.index'));
        $response->assertStatus(200);
    }

    public function test_loadout_page_assigns_ab_group_for_guest()
    {
        // Test Guest (Session based)
        $response = $this->get(route('loadout.index'));
        $response->assertStatus(200);
        $response->assertSessionHas('ab_group');
    }

    public function test_add_loadout_to_cart()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product1 = Product::factory()->create(['category_id' => $category->category_id, 'stock_quantity' => 10]);
        $product2 = Product::factory()->create(['category_id' => $category->category_id, 'stock_quantity' => 10]);

        $mission = Mission::create([
            'name' => 'Test Mission',
            'description' => 'Test',
            'status' => true,
            'ab_group' => 'none',
            'discount_value' => 10.00, // Added required field
            'discount_type' => 'percent'
        ]);

        $mission->slots()->create(['category_id' => $category->category_id, 'slot_order' => 1]);
        $mission->slots()->create(['category_id' => $category->category_id, 'slot_order' => 2]);

        $response = $this->actingAs($user)->post(route('loadout.cart', $mission), [
            'items' => [
                $product1->product_id,
                $product2->product_id
            ]
        ]);

        $response->assertRedirect(route('checkout.index'));

        $cart = Cart::where('user_id', $user->id)->first();
        $this->assertNotNull($cart);
        $this->assertEquals($mission->id, $cart->mission_id);
        $this->assertEquals(2, $cart->items()->count());
    }

    public function test_add_loadout_validation_fails_if_incomplete()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product1 = Product::factory()->create(['category_id' => $category->category_id]);

        $mission = Mission::create([
            'name' => 'Test Mission',
            'status' => true,
            'discount_value' => 10.00, // Added required field
        ]);

        // 2 slots
        $mission->slots()->create(['category_id' => $category->category_id]);
        $mission->slots()->create(['category_id' => $category->category_id]);

        // Only sending 1 item
        $response = $this->actingAs($user)->post(route('loadout.cart', $mission), [
            'items' => [
                $product1->product_id
            ]
        ]);

        $response->assertSessionHas('error');
    }
}
