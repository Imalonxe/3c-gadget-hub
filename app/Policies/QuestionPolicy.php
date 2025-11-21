<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuestionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All users can view questions
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Question $question): bool
    {
        return $question->status === Question::STATUS_PUBLISHED || 
               $user->isAdmin() || 
               $question->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can ask questions
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Question $question): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Users can edit their own questions if not closed or hidden
        return $question->user_id === $user->id && 
               !in_array($question->status, [Question::STATUS_CLOSED, Question::STATUS_HIDDEN]);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Question $question): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Users can delete their own questions if not answered
        return $question->user_id === $user->id && !$question->answers()->exists();
    }

    /**
     * Determine whether the user can update status.
     */
    public function updateStatus(User $user, Question $question): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can vote.
     */
    public function vote(User $user, Question $question): bool
    {
        // Users cannot vote on their own questions
        return $question->user_id !== $user->id && 
               $question->status === Question::STATUS_PUBLISHED;
    }

    /**
     * Determine whether the user can comment.
     */
    public function comment(User $user, Question $question): bool
    {
        return $question->status === Question::STATUS_PUBLISHED;
    }
}