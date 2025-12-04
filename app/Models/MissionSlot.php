<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MissionSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_id',
        'category_id',
        'slot_order',
    ];

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }
}
