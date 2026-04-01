<?php

namespace Tests\Feature;

use App\Models\Mission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExperimentManagerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_link_variant_to_control()
    {
        $this->withoutExceptionHandling();
        $admin = User::factory()->create(['is_admin' => true]);
        $control = Mission::create(['name' => 'Control Mission', 'ab_group' => 'A', 'discount_type' => 'percent', 'discount_value' => 10]);
        $variant = Mission::create(['name' => 'Variant Mission', 'ab_group' => 'B', 'discount_type' => 'percent', 'discount_value' => 15]);

        $response = $this->actingAs($admin)->post(route('admin.analytics.experiments.store'), [
            'parent_id' => $control->id,
            'variant_ids' => [$variant->id],
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals($control->id, $variant->fresh()->parent_mission_id);
    }

    public function test_cannot_link_group_a_to_group_a()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $control1 = Mission::create(['name' => 'Control 1', 'ab_group' => 'A', 'discount_type' => 'percent', 'discount_value' => 10]);
        $control2 = Mission::create(['name' => 'Control 2', 'ab_group' => 'A', 'discount_type' => 'percent', 'discount_value' => 10]);

        $response = $this->actingAs($admin)->post(route('admin.analytics.experiments.store'), [
            'parent_id' => $control1->id,
            'variant_ids' => [$control2->id],
        ]);

        $this->assertNull($control2->fresh()->parent_mission_id);
    }

    public function test_can_unlink_variant()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $control = Mission::create(['name' => 'Control Mission', 'ab_group' => 'A', 'discount_type' => 'percent', 'discount_value' => 10]);
        $variant = Mission::create(['name' => 'Variant Mission', 'ab_group' => 'B', 'parent_mission_id' => $control->id, 'discount_type' => 'percent', 'discount_value' => 15]);

        $response = $this->actingAs($admin)->delete(route('admin.analytics.experiments.destroy', $variant->id));

        $response->assertSessionHas('success');
        $this->assertNull($variant->fresh()->parent_mission_id);
    }
}
