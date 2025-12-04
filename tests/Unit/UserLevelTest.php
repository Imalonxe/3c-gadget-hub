<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\LevelBenefit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserLevelTest extends TestCase
{
    use RefreshDatabase;

    public function test_level_calculation_from_xp()
    {
        $user = User::factory()->create(['xp' => 0, 'level' => 1]);

        // Level 1: 0 XP
        $this->assertEquals(1, $user->level);

        // Level 2: 100 XP (sqrt(100/100) + 1 = 2)
        $user->addXp(100);
        $this->assertEquals(2, $user->fresh()->level);

        // Level 3: 400 XP (sqrt(400/100) + 1 = 3)
        $user->addXp(300); // Total 400
        $this->assertEquals(3, $user->fresh()->level);
    }

    public function test_effective_benefits_aggregation()
    {
        $user = User::factory()->create(['level' => 3]);

        // Level 1: 5% discount
        LevelBenefit::create([
            'level' => 1,
            'discount_percentage' => 5.00,
            'free_shipping' => false,
        ]);

        // Level 2: Free shipping (limit 2)
        LevelBenefit::create([
            'level' => 2,
            'discount_percentage' => 0,
            'free_shipping' => true,
            'free_shipping_limit' => 2,
        ]);

        // Level 3: 10% discount
        LevelBenefit::create([
            'level' => 3,
            'discount_percentage' => 10.00,
            'free_shipping' => true,
            'free_shipping_limit' => 5,
        ]);

        $benefits = $user->getEffectiveLevelBenefits();

        // Should take max discount (10%)
        $this->assertEquals(10.00, $benefits->discount_percentage);
        
        // Should have free shipping
        $this->assertTrue($benefits->free_shipping);
        
        // Should take max limit (5)
        $this->assertEquals(5, $benefits->free_shipping_limit);
    }

    public function test_unlimited_free_shipping_override()
    {
        $user = User::factory()->create(['level' => 5]);

        // Level 2: Limit 5
        LevelBenefit::create([
            'level' => 2,
            'free_shipping' => true,
            'free_shipping_limit' => 5,
        ]);

        // Level 5: Unlimited (null)
        LevelBenefit::create([
            'level' => 5,
            'free_shipping' => true,
            'free_shipping_limit' => null,
        ]);

        $benefits = $user->getEffectiveLevelBenefits();

        $this->assertTrue($benefits->free_shipping);
        $this->assertNull($benefits->free_shipping_limit);
    }
}
