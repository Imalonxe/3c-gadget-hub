<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Badge;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_badges()
    {
        $user = User::factory()->create();
        $badge = Badge::create([
            'name' => 'Early Adopter',
            'description' => 'Joined early',
            'icon_path' => 'badges/early.png',
            'condition_type' => 'manual',
            'condition_value' => '0' // Added required field
        ]);

        $user->badges()->attach($badge, ['awarded_at' => now()]);

        $response = $this->actingAs($user)->get(route('badges.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Badges/Index')
            ->has('badges', 1)
        );
    }
}
