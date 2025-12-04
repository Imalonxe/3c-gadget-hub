<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => 'ORD-' . Str::upper(Str::random(10)),
            'total_amount' => $this->faker->randomFloat(2, 100, 1000),
            'order_status' => Order::STATUS_PENDING_PAYMENT,
            'payment_status' => Order::PAYMENT_PENDING,
            'payment_method' => 'cod',
            'shipping_address_id' => \App\Models\Address::factory(),
            'subtotal' => 0,
            'tax' => 0,
            'shipping_fee' => 0,
        ];
    }
}
