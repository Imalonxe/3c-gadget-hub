<?php

namespace App\Policies;

use App\Models\Answer;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AnswerPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can answer questions
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Answer $answer): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Users can edit their own answers if question is not closed
        return $answer->user_id === $user->id && 
               $answer->question->status !== 'closed';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Answer $answer): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Users can delete their own answers if not accepted
        return $answer->user_id === $user->id && !$answer->is_accepted;
    }

    /**
     * Determine whether the user can accept the answer.
     */
    public function accept(User $user, Answer $answer): bool
    {
        // Only the question owner or admin can accept answers
        return $user->isAdmin() || $answer->question->user_id === $user->id;
    }

    /**
     * Determine whether the user can mark answer as helpful.
     */
    public function markHelpful(User $user, Answer $answer): bool
    {
        // Users cannot mark their own answers as helpful
        return $answer->user_id !== $user->id;
    }

    /**
     * Determine whether the user can vote.
     */
    public function vote(User $user, Answer $answer): bool
    {
        // Users cannot vote on their own answers
        return $answer->user_id !== $user->id && 
               $answer->question->status === 'published';
    }

    /**
     * Determine whether the user can comment.
     */
    public function comment(User $user, Answer $answer): bool
    {
        return $answer->question->status === 'published';
    }

    /**
     * Determine whether the user can approve the answer.
     */
    public function approve(User $user, Answer $answer): bool
    {
        return $user->isAdmin();
    }
}