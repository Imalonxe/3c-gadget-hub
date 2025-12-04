<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_ticket()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('contact.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'topic' => 'general',
            'subject' => 'Help me',
            'message' => 'I need help',
            'priority' => 'medium'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tickets', [
            'user_id' => $user->id,
            'subject' => 'Help me',
            'priority' => 'medium'
        ]);
    }

    public function test_user_can_reply_to_ticket()
    {
        $user = User::factory()->create();
        $ticket = Ticket::create([
            'user_id' => $user->id,
            'name' => 'Test User',
            'email' => 'test@example.com',
            'topic' => 'general',
            'subject' => 'Test Ticket',
            'message' => 'Initial message',
            'status' => 'open',
            'priority' => 'low'
        ]);

        $response = $this->actingAs($user)->post(route('my-tickets.reply', $ticket), [
            'message' => 'My reply'
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('ticket_replies', [
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => 'My reply'
        ]);
    }
}
