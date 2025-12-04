<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\PriceAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PriceAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_price_alert()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->category_id, 'price' => 1000]);

        $response = $this->actingAs($user)->post(route('price-alerts.store'), [
            'product_id' => $product->product_id,
            'target_price' => 900
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('price_alerts', [
            'user_id' => $user->id,
            'product_id' => $product->product_id,
            'target_price' => 900
        ]);
    }

    public function test_user_can_delete_price_alert()
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->category_id]);
        
        $alert = PriceAlert::create([
            'user_id' => $user->id,
            'product_id' => $product->product_id,
            'target_price' => 500,
            'initial_price' => 1000 // Added required field
        ]);

        $response = $this->actingAs($user)->delete(route('price-alerts.destroy', $alert));

        $response->assertRedirect();
        $this->assertDatabaseMissing('price_alerts', ['id' => $alert->id]);
    }
}
