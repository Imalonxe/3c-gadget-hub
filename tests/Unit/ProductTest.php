<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_scope_active_returns_only_active_products()
    {
        Product::factory()->create(['is_active' => true]);
        Product::factory()->create(['is_active' => false]);

        $activeProducts = Product::active()->get();

        $this->assertCount(1, $activeProducts);
        $this->assertTrue($activeProducts->first()->is_active);
    }

    public function test_scope_featured_returns_only_featured_products()
    {
        Product::factory()->create(['is_featured' => true]);
        Product::factory()->create(['is_featured' => false]);

        $featuredProducts = Product::featured()->get();

        $this->assertCount(1, $featuredProducts);
        $this->assertTrue($featuredProducts->first()->is_featured);
    }

    public function test_has_stock_returns_true_when_stock_is_greater_than_zero()
    {
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $this->assertTrue($product->stock_quantity > 0);
    }

    public function test_has_stock_returns_false_when_stock_is_zero()
    {
        $product = Product::factory()->create(['stock_quantity' => 0]);

        $this->assertEquals(0, $product->stock_quantity);
    }

    public function test_decrement_stock_reduces_quantity()
    {
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $product->decrementStock(2);

        $this->assertEquals(8, $product->stock_quantity);
    }

    public function test_increment_stock_increases_quantity()
    {
        $product = Product::factory()->create(['stock_quantity' => 10]);

        $product->incrementStock(5);

        $this->assertEquals(15, $product->stock_quantity);
    }

    public function test_is_available_checks_active_and_stock()
    {
        $availableProduct = Product::factory()->create(['is_active' => true, 'stock_quantity' => 10]);
        $inactiveProduct = Product::factory()->create(['is_active' => false, 'stock_quantity' => 10]);
        $outOfStockProduct = Product::factory()->create(['is_active' => true, 'stock_quantity' => 0]);

        $this->assertTrue($availableProduct->isAvailable());
        $this->assertFalse($inactiveProduct->isAvailable());
        $this->assertFalse($outOfStockProduct->isAvailable());
    }
}
