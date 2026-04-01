<?php

namespace Tests\Unit;

use App\Models\Announcement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementTest extends TestCase
{
    use RefreshDatabase;

    public function test_scope_active_returns_currently_active_announcements()
    {
        // Active: start yesterday, end tomorrow
        Announcement::factory()->create([
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        // Inactive: is_active = false
        Announcement::factory()->create([
            'is_active' => false,
            'start_date' => now()->subDay(),
            'end_date' => now()->addDay(),
        ]);

        // Inactive: ended yesterday
        Announcement::factory()->create([
            'is_active' => true,
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDay(),
        ]);

        // Inactive: starts tomorrow
        Announcement::factory()->create([
            'is_active' => true,
            'start_date' => now()->addDay(),
            'end_date' => now()->addDays(5),
        ]);

        $activeAnnouncements = Announcement::active()->get();

        $this->assertCount(1, $activeAnnouncements);
    }
}
