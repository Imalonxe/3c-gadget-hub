<?php

namespace Tests\Unit;

use App\Models\ShippingProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_calculate_cost_returns_base_fee()
    {
        $provider = ShippingProvider::factory()->create([
            'base_fee' => 50
        ]);

        $this->assertEquals(50, $provider->calculateCost(10)); // Weight doesn't matter for now
    }
}
