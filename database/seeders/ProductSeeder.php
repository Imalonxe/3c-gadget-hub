<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $categories = DB::table('categories')->pluck('category_id', 'slug');

        $products = [
            [
                'category_id' => $categories->get('phones'),
                'product_name' => 'Example Phone X',
                'slug' => Str::slug('Example Phone X'),
                'sku' => 'PHX-001',
                'description' => 'A great smartphone example.',
                'specifications' => json_encode(['color' => 'black', 'storage' => '128GB']),
                'price' => 499.99,
                'compare_price' => 599.99,
                'cost_price' => 300.00,
                'stock_quantity' => 100,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'category_id' => $categories->get('laptops'),
                'product_name' => 'Example Laptop Pro',
                'slug' => Str::slug('Example Laptop Pro'),
                'sku' => 'LTP-001',
                'description' => 'A powerful laptop example.',
                'specifications' => json_encode(['ram' => '16GB', 'cpu' => 'i7']),
                'price' => 1299.99,
                'compare_price' => 1499.99,
                'cost_price' => 900.00,
                'stock_quantity' => 50,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($products as $p) {
            DB::table('products')->updateOrInsert(['slug' => $p['slug']], $p);
        }
    }
}
