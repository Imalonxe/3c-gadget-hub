<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class QuestionController extends Controller
{
    /**
     * Display a listing of the questions.
     */
    public function index(Request $request): Response
    {
        $questions = Question::with(['user', 'images'])
            ->where('status', 'published')
            ->latest()
            ->get();

        return Inertia::render('Community/Questions/Index', [
            'questions' => $questions,
            'filters' => $request->only(['search', 'status', 'product_id', 'is_answered']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Store a newly created question in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        try {
            $validated = $request->validated();
            $validated['user_id'] = auth()->id();
            $validated['status'] = 'published';
            $validated['votes_count'] = 0;
            $validated['answers_count'] = 0;
            $validated['views_count'] = 0;
            
            $question = Question::create($validated);
            
            // Handle image uploads
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                foreach ($images as $index => $image) {
                    $path = $image->store('community/questions', 'public');
                    $question->images()->create([
                        'image_path' => $path,
                        'display_order' => $index
                    ]);
                }
            }
            
            \Log::info('Question created:', ['question' => $question->toArray()]);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Question created successfully.',
                    'question' => $question->load(['user', 'images'])
                ]);
            }

            return redirect()
                ->route('questions.index')
                ->with('success', 'Question posted successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors (including rate limit)
            if ($request->wantsJson()) {
                return response()->json([
                    'errors' => $e->errors(),
                    'message' => 'Validation failed.'
                ], 422);
            }

            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            \Log::error('Error creating question:', ['error' => $e->getMessage()]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'error' => 'Failed to create question: ' . $e->getMessage()
                ], 500);
            }

            return redirect()
                ->route('questions.index')
                ->with('error', 'Failed to create question: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified question.
     */
    public function show(Question $question): Response
    {
        $question->load([
            'user',
            'images',
            'answers' => function($query) {
                $query->with(['user', 'images', 'comments' => function($q) {
                    $q->with(['user', 'images'])->latest();
                }])
                    ->latest();
            }
        ]);

        // Increment view count
        $question->incrementViews();

        // Check if current user can edit this question
        $canEdit = auth()->check() && 
                   $question->user_id === auth()->id() && 
                   $question->edit_count < 1;

        return Inertia::render('Community/Questions/Show', [
            'question' => $question,
            'canEdit' => $canEdit,
        ]);
    }

    /**
     * Update the specified question in storage.
     */
    public function update(UpdateQuestionRequest $request, Question $question)
    {
        // Check if user can edit (only owner and only once)
        if ($question->user_id !== auth()->id()) {
            abort(403, 'You can only edit your own questions.');
        }

        if ($question->edit_count >= 1) {
            return back()->withErrors([
                'edit_limit' => 'You can only edit your question once.'
            ]);
        }

        // Store original content before edit
        $validated = $request->validated();
        $validated['content_before_edit'] = $question->content;
        $validated['edited_at'] = now();
        $validated['edit_count'] = $question->edit_count + 1;

        // Handle image deletion
        if ($request->has('deleted_image_ids')) {
            $deletedIds = json_decode($request->deleted_image_ids, true);
            if (is_array($deletedIds)) {
                foreach ($deletedIds as $imageId) {
                    $image = $question->images()->find($imageId);
                    if ($image) {
                        // Delete file from storage
                        if (Storage::disk('public')->exists($image->image_path)) {
                            Storage::disk('public')->delete($image->image_path);
                        }
                        // Delete from database
                        $image->delete();
                    }
                }
            }
        }

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            $existingImageCount = $question->images()->count();
            $maxDisplayOrder = $question->images()->max('display_order') ?? -1;
            
            foreach ($images as $index => $image) {
                $path = $image->store('community/questions', 'public');
                $question->images()->create([
                    'image_path' => $path,
                    'display_order' => $maxDisplayOrder + $index + 1
                ]);
            }
        }

        // Remove images and deleted_image_ids from validated data before updating
        unset($validated['images']);
        unset($validated['deleted_image_ids']);

        $question->update($validated);

        // Reload question with images
        $question->load('images');

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Question updated successfully.',
                'question' => $question
            ]);
        }

        return back()->with('success', 'Question updated successfully.');
    }

    /**
     * Update question status.
     */
    public function updateStatus(Request $request, Question $question)
    {
        $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', [
                Question::STATUS_PENDING,
                Question::STATUS_PUBLISHED,
                Question::STATUS_CLOSED,
                Question::STATUS_HIDDEN
            ])]
        ]);

        $question->update(['status' => $request->status]);

        return back()->with('success', 'Question status updated successfully.');
    }

    /**
     * Admin listing for questions with pagination and optional search.
     * Accessible to admins via admin middleware in routes.
     */
    public function adminIndex(Request $request)
    {
        // Only admins should reach this route (middleware 'admin' is applied on route group).

        $query = Question::with('user')->orderBy('created_at', 'desc');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $questions = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Questions/Index', [
            'questions' => $questions,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show a single question in the admin UI.
     */
    public function adminShow(Question $question)
    {
        $question->load(['user', 'answers.user']);

        return Inertia::render('Admin/Questions/Show', [
            'question' => $question,
        ]);
    }

    /**
     * Vote for the question.
     */
    public function vote(Request $request, Question $question)
    {
        $request->validate([
            'value' => ['required', 'integer', 'in:-1,1']
        ]);

        $vote = $question->votes()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['value' => $request->value]
        );

        $question->updateVotesCount();

        return response()->json([
            'message' => 'Vote recorded successfully.',
            'votes_count' => $question->votes_count
        ]);
    }

    /**
     * Remove the specified question.
     */
    public function destroy(Question $question)
    {
        $this->authorize('delete', $question);
        
        $question->delete();

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Question deleted successfully.'
            ]);
        }

        return redirect()
            ->route('questions.index')
            ->with('success', 'Question deleted successfully.');
    }
}