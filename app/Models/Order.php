<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Address;

class Order extends Model
{
    use HasFactory;

    /**
     * Register model event listeners.
     *
     * Always notify the order owner when the order_status column changes.
     * Using a model-level listener ensures notifications are sent regardless
     * of where the status change originates (controllers, jobs, tinker, etc.).
     */
    protected static function booted()
    {
        static::updated(function (Order $order) {
            // If the DB status column changed, notify the user with the previous value
            if ($order->wasChanged('order_status') && $order->user) {
                $old = $order->getOriginal('order_status');
                try {
                    $order->user->notify(new \App\Notifications\OrderStatusNotification($order, $old));
                } catch (\Exception $e) {
                    \Log::error('Failed to notify user about order status change (model observer): ' . $e->getMessage());
                }
            }
        });
    }

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'order_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'order_number',
        'order_status',
        'payment_status',
        'payment_method',
        'subtotal',
        'shipping_fee',
        'tax',
        'discount',
        'total_amount',
        'shipping_method',
        'tracking_number',
        'shipping_address_id',
        'billing_address_id',
        'notes',
        'paid_at',
        'shipped_at',
        'delivered_at',
    ];
    
    /**
     * The attributes that should have default values.
     *
     * @var array
     */
    protected $attributes = [
        'order_status' => self::STATUS_PENDING_PAYMENT,
        'payment_status' => self::PAYMENT_PENDING
    ];

    /**
     * Accessors to append to the model's array / JSON form.
     * We expose `status` (virtual accessor) and `total` for backward compatibility
     * so the frontend receives these properties when the model is serialized.
     */
    protected $appends = ['status', 'total'];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * The possible order statuses.
     * These must match the enum values in the orders migration.
     */
    const STATUS_PENDING_PAYMENT = 'pending_payment';
    const STATUS_PAID = 'paid';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPING = 'shipping';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REFUNDED = 'refunded';

    // Backwards-compatible alias for older code
    const STATUS_PENDING = self::STATUS_PENDING_PAYMENT;
    
    // alias for shipping name used elsewhere
    const STATUS_SHIPPED = self::STATUS_SHIPPING;

    /**
     * The possible payment statuses.
     */
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_FAILED = 'failed';
    const PAYMENT_REFUNDED = 'refunded';

    /**
     * Get the user who placed the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'order_id');
    }

    /**
     * Get the products in the order.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items', 'order_id', 'product_id', 'order_id', 'product_id')
            ->withPivot('quantity', 'price')
            ->withTimestamps();
    }

    /**
     * Get the order transactions.
     */
    public function transactions(): HasMany
    {
        // The Order model uses a primary key named `order_id`, so Eloquent's
        // default foreign key would become `order_order_id`. Our
        // `transactions` table uses `order_id` as the foreign key, so specify
        // it explicitly to avoid incorrect column names in queries.
        return $this->hasMany(Transaction::class, 'order_id', 'order_id');
    }

    /**
     * Get the shipping address for the order.
     */
    public function shippingAddress(): BelongsTo
    {
        return $this->belongsTo(Address::class, 'shipping_address_id', 'address_id');
    }

    /**
     * Scope a query to only include orders with a specific status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('order_status', $status);
    }

    /**
     * Check if the order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->order_status, [self::STATUS_PENDING_PAYMENT, self::STATUS_PROCESSING]);
    }

    /**
     * Check if the order is completed (delivered).
     */
    public function isCompleted(): bool
    {
        return $this->order_status === self::STATUS_DELIVERED;
    }

    /**
     * Use `order_id` for route model binding.
     * By default Laravel uses the `id` column when resolving route models.
     * Our primary key is `order_id`, so ensure the route key name matches.
     */
    public function getRouteKeyName(): string
    {
        return 'order_id';
    }

    /**
     * Calculate and update the order totals.
     */
    public function calculateTotals(): void
    {
        $this->subtotal = $this->items->sum(function ($item) {
            return $item->unit_price * $item->quantity;
        });
        
        // Apply discount if present (ensure it's numeric and not negative)
        $discount = (float) ($this->discount ?? 0);
        if ($discount < 0) {
            $discount = 0;
        }

        // Subtotal after discount
        $subtotalAfterDiscount = max(0, $this->subtotal - $discount);

        // Calculate tax (assuming 7% VAT) on discounted subtotal
        $this->tax = $subtotalAfterDiscount * 0.07;

        // Add shipping fee and tax to get total
        $this->total_amount = $subtotalAfterDiscount + $this->shipping_fee + $this->tax;
        
        $this->save();
    }

    /**
     * Backwards-compatible accessor for `total` used in some frontend views.
     * Returns the `total_amount` column so templates that reference `order.total`
     * continue to work.
     */
    public function getTotalAttribute()
    {
        return $this->total_amount;
    }

    /**
     * Virtual accessor for `status` used across views (backwards-compatible).
     * Normalizes DB values (e.g. 'pending_payment') to shorter names used in the UI
     * (e.g. 'pending').
     */
    public function getStatusAttribute()
    {
        $map = [
            'pending_payment' => 'pending',
            'shipping' => 'shipped',
        ];

        return $map[$this->order_status] ?? $this->order_status;
    }

    /**
     * Allow setting `status` (UI) and map it to the DB column `order_status`.
     * Accepts either UI-friendly values ('pending','shipped') or DB values
     * ('pending_payment','shipping').
     */
    public function setStatusAttribute($value)
    {
        $reverse = [
            'pending' => 'pending_payment',
            'shipped' => 'shipping',
        ];

        $this->attributes['order_status'] = $reverse[$value] ?? $value;
    }
}