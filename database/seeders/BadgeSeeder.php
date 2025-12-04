<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            [
                'name' => 'First Order',
                'description' => 'Completed your first order.',
                'icon' => 'LuPackage',
                'condition_type' => 'orders_count',
                'condition_value' => 1,
                'xp_reward' => 50,
            ],
            [
                'name' => 'Loyal Customer',
                'description' => 'Completed 5 orders.',
                'icon' => 'LuStar',
                'condition_type' => 'orders_count',
                'condition_value' => 5,
                'xp_reward' => 200,
            ],
            [
                'name' => 'Big Spender',
                'description' => 'Spent over ฿10,000 in a single order.',
                'icon' => 'LuGem',
                'condition_type' => 'single_order_amount',
                'condition_value' => 10000,
                'xp_reward' => 500,
            ],
        ];

        foreach ($badges as $badge) {
            \App\Models\Badge::firstOrCreate(['name' => $badge['name']], $badge);
        }
    }
}
