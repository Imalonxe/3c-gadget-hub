<?php

namespace Database\Factories;

use App\Models\ShippingProvider;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShippingProviderFactory extends Factory
{
    protected $model = ShippingProvider::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'code' => $this->faker->unique()->slug(),
            'base_fee' => $this->faker->numberBetween(30, 100),
            'description' => $this->faker->sentence(),
            'estimated_days' => $this->faker->numberBetween(1, 5),
            'is_active' => true,
        ];
    }
}
