<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Vote extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'voteable_id',
        'voteable_type',
        'value',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'integer',
    ];

    /**
     * Get the user who cast the vote.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent voteable model (Question or Answer).
     */
    public function voteable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include upvotes.
     */
    public function scopeUpvotes($query)
    {
        return $query->where('value', 1);
    }

    /**
     * Scope a query to only include downvotes.
     */
    public function scopeDownvotes($query)
    {
        return $query->where('value', -1);
    }
}