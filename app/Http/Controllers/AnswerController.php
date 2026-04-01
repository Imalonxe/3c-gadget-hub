<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use App\Http\Requests\StoreAnswerRequest;
use App\Http\Requests\UpdateAnswerRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;

class AnswerController extends Controller
{
    use LogsActivity;
    /**
     * Store a newly created answer in storage.
     */
    public function store(StoreAnswerRequest $request, Question $question)
    {
        $answer = $question->answers()->create(array_merge(
            $request->validated(),
            ['user_id' => $request->user()->id]
        ));

        // Update question's answers count and last activity
        $question->updateAnswersCount();
        $question->touch();

        // Log answer creation
        $this->logActivity('create_answer', [
            'answer_id' => $answer->answer_id,
            'question_id' => $question->question_id,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Answer posted successfully.',
                'answer' => $answer->load('user')
            ]);
        }

        return back()->with('success', 'Answer posted successfully.');
    }

    /**
     * Update the specified answer in storage.
     */
    public function update(UpdateAnswerRequest $request, Answer $answer)
    {
        $this->authorize('update', $answer);

        $answer->update($request->validated());

        // Log answer update
        $this->logActivity('update_answer', [
            'answer_id' => $answer->answer_id,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Answer updated successfully.',
                'answer' => $answer->load('user')
            ]);
        }

        return back()->with('success', 'Answer updated successfully.');
    }

    /**
     * Mark an answer as accepted.
     */
    public function accept(Answer $answer)
    {
        $this->authorize('accept', $answer);

        $answer->markAsAccepted();

        // Log answer acceptance
        $this->logActivity('accept_answer', [
            'answer_id' => $answer->answer_id,
            'question_id' => $answer->question_id,
        ]);

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Answer marked as accepted.',
                'answer' => $answer
            ]);
        }

        return back()->with('success', 'Answer marked as accepted.');
    }

    /**
     * Mark an answer as helpful.
     */
    public function markHelpful(Answer $answer)
    {
        $answer->markAsHelpful();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Answer marked as helpful.',
                'answer' => $answer
            ]);
        }

        return back()->with('success', 'Answer marked as helpful.');
    }

    /**
     * Vote for the answer.
     */
    public function vote(Request $request, Answer $answer)
    {
        $request->validate([
            'value' => ['required', 'integer', 'in:-1,1']
        ]);

        $vote = $answer->votes()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['value' => $request->value]
        );

        $answer->updateVotesCount();

        // Log answer vote
        $this->logActivity('vote_answer', [
            'answer_id' => $answer->answer_id,
            'vote_value' => $request->value,
        ]);

        return response()->json([
            'message' => 'Vote recorded successfully.',
            'votes_count' => $answer->votes_count
        ]);
    }

    /**
     * Remove the specified answer.
     */
    public function destroy(Answer $answer)
    {
        $this->authorize('delete', $answer);

        $question = $answer->question;
        $answerId = $answer->answer_id;
        $answer->delete();

        // Update question's answers count
        $question->updateAnswersCount();

        // Log answer deletion
        $this->logActivity('delete_answer', [
            'answer_id' => $answerId,
            'question_id' => $question->question_id,
        ]);

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Answer deleted successfully.'
            ]);
        }

        return back()->with('success', 'Answer deleted successfully.');
    }
}