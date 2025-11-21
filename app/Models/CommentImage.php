<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentImage extends Model
{
    protected $fillable = [
        'comment_id',
        'image_path',
        'display_order',
    ];

    /**
     * Get the comment that owns the image.
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}
