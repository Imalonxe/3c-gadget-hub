<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // Added this line
use App\Models\User; // Added this line

class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'condition_type',
        'condition_value',
        'xp_reward',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('awarded_at')
            ->withTimestamps();
    }
}
