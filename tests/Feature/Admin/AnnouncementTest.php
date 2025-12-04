<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Announcement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_announcement()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post(route('admin.announcements.store'), [
            'title' => 'Big Sale',
            'content' => '50% off',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'is_active' => true,
            'type' => 'info'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('announcements', [
            'title' => 'Big Sale',
            'content' => '50% off'
        ]);
    }

    public function test_admin_can_toggle_announcement_active()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $announcement = Announcement::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->post(route('admin.announcements.toggle-active', $announcement));

        $response->assertRedirect();
        $this->assertFalse($announcement->fresh()->is_active);
    }
}
