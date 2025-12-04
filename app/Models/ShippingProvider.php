<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingProvider extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'code',
        'base_fee',
        'description',
        'logo_url',
        'estimated_days',
        'is_active',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_fee' => 'decimal:2',
        'is_active' => 'boolean',
        'estimated_days' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Scope a query to only include active shipping providers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to order by sort_order and name.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Get the orders for this shipping provider.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
    /**
     * Calculate shipping cost.
     * Currently returns base_fee as we don't have weight-based logic yet.
     */
    public function calculateCost(float $weight = 0): float
    {
        return $this->base_fee;
    }
}
