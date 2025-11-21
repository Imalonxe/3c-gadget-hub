<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class Question extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'product_id',
        'title',
        'content',
        'content_before_edit',
        'status',
        'slug',
        'is_answered',
        'is_approved',
        'views_count',
        'votes_count',
        'answers_count',
        'last_activity_at',
        'tags',
        'edited_at',
        'edit_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_answered' => 'boolean',
        'is_approved' => 'boolean',
        'views_count' => 'integer',
        'votes_count' => 'integer',
        'answers_count' => 'integer',
        'last_activity_at' => 'datetime',
        'tags' => 'array',
        'edited_at' => 'datetime',
        'edit_count' => 'integer',
    ];

    /**
     * Attributes to append to the model when serializing.
     * We include `question_id` so frontend code that expects this key
     * (the admin UI) works consistently.
     */
    protected $appends = ['question_id'];

    /**
     * The possible question statuses.
     */
    const STATUS_PENDING = 'pending';
    const STATUS_PUBLISHED = 'published';
    const STATUS_CLOSED = 'closed';
    const STATUS_HIDDEN = 'hidden';

    /**
     * Get the user who asked the question.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product this question is about.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the answers to this question.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }

    /**
     * Get all comments for this question.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get all votes for this question.
     */
    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'voteable');
    }

    /**
     * Get all images for this question.
     */
    public function images(): HasMany
    {
        return $this->hasMany(QuestionImage::class)->orderBy('display_order');
    }

    /**
     * Get the accepted answer for this question.
     */
    public function acceptedAnswer(): HasMany
    {
        return $this->answers()->where('is_accepted', true);
    }

    /**
     * Scope a query to only include published questions.
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED);
    }

    /**
     * Scope a query to only include answered questions.
     */
    public function scopeAnswered($query)
    {
        return $query->where('is_answered', true);
    }

    /**
     * Scope a query to only include approved questions.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope a query to only include questions with a specific tag.
     */
    public function scopeWithTag($query, string $tag)
    {
        return $query->where('tags', 'like', '%' . $tag . '%');
    }

    /**
     * Scope a query to order by most recent activity.
     */
    public function scopeRecentlyActive($query)
    {
        return $query->orderBy('last_activity_at', 'desc');
    }

    /**
     * Increment the views count.
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
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
     * Update the answers count.
     */
    public function updateAnswersCount(): void
    {
        $this->answers_count = $this->answers()->count();
        $this->save();
    }

    /**
     * Update last activity timestamp.
     */
    public function touch($attribute = null): bool
    {
        $this->last_activity_at = now();
        return parent::touch($attribute);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($question) {
            if (! $question->slug) {
                $question->slug = Str::slug($question->title);
            }
        });
    }

    /**
     * Provide a `question_id` attribute for front-end compatibility.
     */
    public function getQuestionIdAttribute()
    {
        return $this->attributes['question_id'] ?? $this->attributes['id'];
    }

    /**
     * Approve the question.
     */
    public function approve(): void
    {
        $this->is_approved = true;
        $this->save();
    }
}