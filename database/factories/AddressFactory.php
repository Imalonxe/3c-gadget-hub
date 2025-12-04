<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'address_type' => 'shipping',
            'recipient_name' => $this->faker->name(),
            'phone' => $this->faker->phoneNumber(),
            'address_line1' => $this->faker->streetAddress(),
            'address_line2' => $this->faker->secondaryAddress(),
            'district' => $this->faker->city(),
            'province' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'is_default' => false,
        ];
    }
}
