<?php

namespace Tests\Feature;

use App\Models\Mission;
use App\Models\MissionAnalytics;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_analytics_dashboard_calculates_metrics_correctly()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        
        // Create Parent Mission (Control)
        $parent = Mission::create([
            'name' => 'Control Mission',
            'discount_value' => 10,
            'ab_group' => 'A'
        ]);
        
        // Create Variant Mission
        $variant = Mission::create([
            'name' => 'Variant Mission',
            'discount_value' => 10,
            'ab_group' => 'B',
            'parent_mission_id' => $parent->id
        ]);

        // Create Analytics Data
        MissionAnalytics::create([
            'mission_id' => $parent->id,
            'views' => 100,
            'completions' => 10,
            'revenue' => 1000,
            'date' => now()
        ]);

        MissionAnalytics::create([
            'mission_id' => $variant->id,
            'views' => 100,
            'completions' => 20,
            'revenue' => 200,
            'date' => now()
        ]);

        // Create Orders for Variant
        // New User Order
        $user1 = User::factory()->create();
        Order::factory()->create([
            'user_id' => $user1->id,
            'mission_id' => $variant->id,
            'total_amount' => 100,
            'discount' => 10
        ]);

        // Returning User Order
        $user2 = User::factory()->create();
        Order::factory()->create(['user_id' => $user2->id]); // Previous order
        Order::factory()->create([
            'user_id' => $user2->id,
            'mission_id' => $variant->id,
            'total_amount' => 100,
            'discount' => 10
        ]);

        try {
            $this->withoutExceptionHandling();
            $response = $this->actingAs($admin)->get(route('admin.analytics'));
        } catch (\Throwable $e) {
            dd($e->getFile() . ':' . $e->getLine() . ' - ' . $e->getMessage());
            throw $e;
        }

        $response->assertStatus(200);
        
        $abTests = $response->viewData('page')['props']['abTests'];
        $this->assertNotEmpty($abTests);
        
        $test = $abTests[0];
        $this->assertEquals($parent->id, $test['id']);
        
        $variantData = $test['variants'][0];
        $this->assertEquals($variant->id, $variantData['id']);
        $this->assertEquals(2, $variantData['orders']); // 2 orders created
        $this->assertEquals(100, $variantData['aov']); // (100+100)/2
        $this->assertEquals(20, $variantData['total_discount']); // 10+10
        
        $this->assertEquals(1, $variantData['segmentation']['new']);
        $this->assertEquals(1, $variantData['segmentation']['returning']);
    }
}
