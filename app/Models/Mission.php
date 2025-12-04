<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'discount_type',
        'discount_value',
        'status',
        'image_path',
        'start_date',
        'end_date',
        'ab_group',
        'parent_mission_id',
    ];

    protected $casts = [
        'status' => 'boolean',
        'discount_value' => 'decimal:2',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function parent()
    {
        return $this->belongsTo(Mission::class, 'parent_mission_id');
    }

    public function variants()
    {
        return $this->hasMany(Mission::class, 'parent_mission_id');
    }

    public function slots()
    {
        return $this->hasMany(MissionSlot::class)->orderBy('slot_order');
    }

    public function analytics()
    {
        return $this->hasMany(MissionAnalytics::class);
    }
}
