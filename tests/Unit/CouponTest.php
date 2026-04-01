<?php

namespace Tests\Unit;

use App\Models\Coupon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_valid_returns_true_for_valid_coupon()
    {
        $coupon = Coupon::factory()->create([
            'is_active' => true,
            'expires_at' => now()->addDay(),
            'max_uses' => 10,
            'used_count' => 0
        ]);

        $this->assertTrue($coupon->isValid());
    }

    public function test_is_valid_returns_false_for_expired_coupon()
    {
        $coupon = Coupon::factory()->create([
            'expires_at' => now()->subDay()
        ]);

        $this->assertFalse($coupon->isValid());
    }

    public function test_is_valid_returns_false_for_inactive_coupon()
    {
        $coupon = Coupon::factory()->create([
            'is_active' => false
        ]);

        $this->assertFalse($coupon->isValid());
    }

    public function test_is_valid_returns_false_when_usage_limit_reached()
    {
        $coupon = Coupon::factory()->create([
            'max_uses' => 5,
            'used_count' => 5
        ]);

        $this->assertFalse($coupon->isValid());
    }

    public function test_calculate_discount_returns_correct_amount_for_fixed_type()
    {
        $coupon = Coupon::factory()->create([
            'type' => 'fixed',
            'value' => 100
        ]);

        $this->assertEquals(100, $coupon->calculateDiscount(500));
    }

    public function test_calculate_discount_returns_correct_amount_for_percentage_type()
    {
        $coupon = Coupon::factory()->create([
            'type' => 'percent',
            'value' => 10
        ]);

        // 10% of 500 = 50
        $this->assertEquals(50, $coupon->calculateDiscount(500));
    }

    public function test_is_applicable_checks_minimum_order_amount()
    {
        $coupon = Coupon::factory()->create([
            'min_order_amount' => 500
        ]);

        $this->assertTrue($coupon->isApplicable(600));
        $this->assertFalse($coupon->isApplicable(400));
    }
}
