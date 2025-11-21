<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'product_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'product_name',
        'slug',
        'description',
        'category_id',
        'brand',
        'model',
        'sku',
        'price',
        'sale_price',
        'stock_quantity',
        'specifications',
        'is_active',
        'is_featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'specifications' => 'json',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id', 'category_id');
    }

    /**
     * Get the product images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'product_id')
            ->orderBy('is_primary', 'desc')
            ->orderBy('display_order');
    }

    /**
     * Get the reviews for the product.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id', 'product_id');
    }

    /**
     * Get the orders that contain this product.
     */
    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_items', 'product_id', 'order_id', 'product_id', 'order_id')
            ->withPivot('quantity', 'price')
            ->withTimestamps();
    }

    /**
     * Get users who have wishlisted this product.
     */
    public function wishlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')
            ->withTimestamps();
    }

    /**
     * Scope a query to only include active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include featured products.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include in-stock products.
     */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    /**
     * Check if the product is on sale.
     */
    public function isOnSale(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->price;
    }

    /**
     * Get the current price (sale price if on sale, regular price otherwise).
     */
    public function getCurrentPrice(): float
    {
        return $this->isOnSale() ? $this->sale_price : $this->price;
    }

    /**
     * Get the attribute values for the product.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values', 'product_id', 'attribute_value_id')
            ->withTimestamps();
    }

    /**
     * Scope a query to filter by attribute values.
     *
     * Accepts arrays and Symfony ParameterBag instances (defensive for unexpected inputs).
     */
    public function scopeFilterByAttributes($query, $attributes)
    {
        // If nothing was passed, just return the query unchanged
        if (empty($attributes)) {
            return $query;
        }

        // If a Symfony ParameterBag was accidentally passed in, convert to array
        if ($attributes instanceof \Symfony\Component\HttpFoundation\ParameterBag) {
            $attributes = $attributes->all();
        }

        // If attributes were passed as JSON string, try to decode
        if (is_string($attributes)) {
            $decoded = json_decode($attributes, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $attributes = $decoded;
            } else {
                // Can't make sense of the string; abort filtering
                return $query;
            }
        }

        // Ensure we have an array to iterate
        if (!is_array($attributes)) {
            return $query;
        }

        foreach ($attributes as $attributeId => $valueIds) {
            if (!is_array($valueIds)) {
                $valueIds = [$valueIds];
            }
            $query->whereHas('attributeValues', function ($q) use ($attributeId, $valueIds) {
                $q->whereIn('attribute_values.id', $valueIds)
                    ->whereHas('attribute', function ($q) use ($attributeId) {
                        $q->where('id', $attributeId);
                    });
            });
        }

        return $query;
    }
    
    /**
     * Scope a query to filter by price range.
     */
    public function scopeFilterByPrice($query, ?float $minPrice = null, ?float $maxPrice = null)
    {
        if ($minPrice !== null) {
            $query->where(function ($q) use ($minPrice) {
                $q->where('price', '>=', $minPrice)
                    ->orWhere('sale_price', '>=', $minPrice);
            });
        }

        if ($maxPrice !== null) {
            $query->where(function ($q) use ($maxPrice) {
                $q->where('price', '<=', $maxPrice)
                    ->orWhere('sale_price', '<=', $maxPrice);
            });
        }

        return $query;
    }
    
    /**
     * Scope a query to filter by availability.
     */
    public function scopeFilterByAvailability($query, string $availability = 'all')
    {
        return match($availability) {
            'in_stock' => $query->where('stock_quantity', '>', 0),
            'out_of_stock' => $query->where('stock_quantity', '=', 0),
            default => $query,
        };
    }
    
    /**
     * Scope a query to filter by brand.
     */
    public function scopeFilterByBrand($query, array $brands)
    {
        return $query->whereIn('brand', $brands);
    }
    
    /**
     * Scope a query to sort products.
     */
    public function scopeSortBy($query, string $sort = 'latest')
    {
        return match($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name_asc' => $query->orderBy('product_name'),
            'name_desc' => $query->orderByDesc('product_name'),
            'featured' => $query->orderByDesc('is_featured')->latest(),
            default => $query->latest(),
        };
    }
}