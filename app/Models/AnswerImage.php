<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerImage extends Model
{
    protected $fillable = [
        'answer_id',
        'image_path',
        'display_order',
    ];

    /**
     * Get the answer that owns the image.
     */
    public function answer(): BelongsTo
    {
        return $this->belongsTo(Answer::class);
    }
}
