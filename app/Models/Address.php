<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    use HasFactory;

    // The table uses `address_id` as the primary key.
    protected $primaryKey = 'address_id';

    /**
     * Append convenience attributes for the frontend (full_name, address, city).
     *
     * @var array<string>
     */
    protected $appends = ['full_name', 'address', 'city'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'address_type',
        'recipient_name',
        'phone',
        'address_line1',
        'address_line2',
        'district',
        'province',
        'postal_code',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'address_type' => 'string',
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the address.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Return full_name expected by the frontend.
     */
    public function getFullNameAttribute(): ?string
    {
        return $this->recipient_name;
    }

    /**
     * Return an `address` string combining address lines.
     */
    public function getAddressAttribute(): ?string
    {
        $parts = array_filter([$this->address_line1, $this->address_line2]);
        return $parts ? implode(' ', $parts) : null;
    }

    /**
     * Return a `city` value mapped from province/district to match frontend expectation.
     */
    public function getCityAttribute(): ?string
    {
        return $this->district ?? $this->province;
    }

    /**
     * Get the full address as a string.
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address_line1,
            $this->address_line2,
            $this->district,
            $this->province,
            $this->postal_code
        ]);
        
        return implode(', ', $parts);
    }
}