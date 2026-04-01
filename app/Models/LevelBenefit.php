<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LevelBenefit extends Model
{
    use HasFactory;

    protected $fillable = [
        'level',
        'discount_percentage',
        'free_shipping',
        'free_shipping_limit',
        'custom_benefits',
    ];

    protected $casts = [
        'free_shipping' => 'boolean',
        'free_shipping_limit' => 'integer',
        'custom_benefits' => 'array',
        'discount_percentage' => 'decimal:2',
    ];
}
