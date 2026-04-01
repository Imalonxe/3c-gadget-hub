<?php

namespace Tests\Feature;

use App\Models\Question;
use App\Models\Answer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_questions_list()
    {
        Question::factory()->count(3)->create(['status' => 'published']);

        $response = $this->get(route('questions.index'));

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_post_question()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('questions.store'), [
                'title' => 'Test Question',
                'content' => 'This is a test question content.',
            ]);

        $response->assertRedirect(route('questions.index'));
        $this->assertDatabaseHas('questions', [
            'title' => 'Test Question',
            'user_id' => $user->id
        ]);
    }

    public function test_authenticated_user_can_answer_question()
    {
        $user = User::factory()->create();
        $question = Question::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('answers.store', $question->question_id), [
                'content' => 'This is a test answer.',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('answers', [
            'content' => 'This is a test answer.',
            'question_id' => $question->question_id,
            'user_id' => $user->id
        ]);
    }

    public function test_guest_cannot_post_question()
    {
        $response = $this->post(route('questions.store'), [
            'title' => 'Test Question',
            'content' => 'This is a test question content.',
        ]);

        $response->assertRedirect(route('login'));
    }
}
