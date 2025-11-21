<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class FixProductRatingsSeeder extends Seeder
{
    public function run()
    {
        Product::all()->each(function($p) {
            $avg = $p->reviews()->approved()->avg('rating') ?: 0;
            $count = $p->reviews()->approved()->count();
            $p->average_rating = round($avg, 1);
            $p->total_reviews = $count;
            $p->save();
        });

        $this->command->info('Updated product ratings for ' . Product::count() . ' products.');
    }
}
