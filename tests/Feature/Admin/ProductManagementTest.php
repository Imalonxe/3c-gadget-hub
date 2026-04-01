<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_product_list()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Product::factory()->count(3)->create();

        $response = $this->actingAs($admin)
            ->get(route('admin.products.index'));

        $response->assertStatus(200);
    }

    public function test_admin_can_create_product()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $category = Category::factory()->create();

        $response = $this->actingAs($admin)
            ->post(route('admin.products.store'), [
                'product_name' => 'New Product',
                'description' => 'Product Description',
                'price' => 100,
                'stock_quantity' => 10,
                'category_id' => $category->category_id,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseHas('products', ['product_name' => 'New Product']);
    }

    public function test_admin_can_update_product()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)
            ->put(route('admin.products.update', $product->product_id), [
                'product_name' => 'Updated Name',
                'description' => $product->description,
                'price' => $product->price,
                'stock_quantity' => $product->stock_quantity,
                'category_id' => $product->category_id,
                'is_active' => true,
                'brand' => 'Test Brand',
                'model' => 'Test Model',
                'sku' => 'TEST-SKU-123',
            ]);

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseHas('products', ['product_name' => 'Updated Name']);
    }

    public function test_admin_can_delete_product()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = Product::factory()->create();

        $response = $this->actingAs($admin)
            ->delete(route('admin.products.destroy', $product->product_id));

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseMissing('products', ['product_id' => $product->product_id]);
    }

    public function test_non_admin_cannot_access_product_management()
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)
            ->get(route('admin.products.index'));

        $response->assertStatus(403); // Or 404/Redirect depending on middleware
    }
}
