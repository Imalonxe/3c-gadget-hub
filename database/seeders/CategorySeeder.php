<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $categories = [
            ['category_name' => 'Phones', 'slug' => Str::slug('Phones'), 'description' => 'Smartphones and accessories', 'created_at' => $now, 'updated_at' => $now],
            ['category_name' => 'Laptops', 'slug' => Str::slug('Laptops'), 'description' => 'Laptops and ultrabooks', 'created_at' => $now, 'updated_at' => $now],
            ['category_name' => 'Accessories', 'slug' => Str::slug('Accessories'), 'description' => 'Chargers, cables, cases', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(['slug' => $cat['slug']], $cat);
        }
    }
}
