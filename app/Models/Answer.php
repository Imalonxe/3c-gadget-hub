<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Answer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'question_id',
        'content',
        'is_accepted',
        'votes_count',
        'is_helpful',
        'is_approved',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_accepted' => 'boolean',
        'votes_count' => 'integer',
        'is_helpful' => 'boolean',
        'is_approved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who provided the answer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the question this answer belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get all comments for this answer.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get all votes for this answer.
     */
    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'voteable');
    }

    /**
     * Get all images for this answer.
     */
    public function images(): HasMany
    {
        return $this->hasMany(AnswerImage::class)->orderBy('display_order');
    }

    /**
     * Scope a query to only include accepted answers.
     */
    public function scopeAccepted($query)
    {
        return $query->where('is_accepted', true);
    }

    /**
     * Scope a query to only include approved answers.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include helpful answers.
     */
    public function scopeHelpful($query)
    {
        return $query->where('is_helpful', true);
    }

    /**
     * Mark this answer as accepted.
     */
    public function markAsAccepted(): void
    {
        // First, unmark any previously accepted answer for this question
        $this->question->answers()->update(['is_accepted' => false]);
        
        // Mark this answer as accepted
        $this->is_accepted = true;
        $this->save();

        // Update the question's answered status
        $this->question->is_answered = true;
        $this->question->save();
    }

    /**
     * Mark this answer as helpful.
     */
    public function markAsHelpful(): void
    {
        $this->is_helpful = true;
        $this->save();
    }

    /**
     * Approve this answer.
     */
    public function approve(): void
    {
        $this->is_approved = true;
        $this->save();
    }

    /**
     * Update the votes count.
     */
    public function updateVotesCount(): void
    {
        $this->votes_count = $this->votes()->sum('value');
        $this->save();
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($answer) {
            $answer->question->updateAnswersCount();
            $answer->question->touch();
        });

        static::deleted(function ($answer) {
            $answer->question->updateAnswersCount();
            $answer->question->touch();
        });
    }
}