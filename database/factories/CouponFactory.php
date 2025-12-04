<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => Str::upper(Str::random(10)),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'type' => 'fixed',
            'value' => $this->faker->numberBetween(10, 100),
            'min_order_amount' => 0,
            'max_uses' => 100,
            'used_count' => 0,
            'is_active' => true,
            'starts_at' => now(),
            'expires_at' => now()->addDays(30),
        ];
    }
}
