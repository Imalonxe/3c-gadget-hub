<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MissionAnalytics extends Model
{
    protected $fillable = [
        'mission_id',
        'views',
        'completions',
        'revenue',
        'date',
    ];

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }
}
