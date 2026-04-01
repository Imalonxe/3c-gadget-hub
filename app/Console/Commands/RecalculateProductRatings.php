<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

class RecalculateProductRatings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'products:recalculate-ratings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate average ratings and total reviews for all products';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Recalculating product ratings...');

        $products = Product::all();
        $bar = $this->output->createProgressBar($products->count());

        foreach ($products as $product) {
            $averageRating = $product->reviews()
                ->approved()
                ->avg('rating');

            $totalReviews = $product->reviews()
                ->approved()
                ->count();

            $product->update([
                'average_rating' => $averageRating ? round($averageRating, 1) : 0,
                'total_reviews' => $totalReviews
            ]);

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Product ratings recalculated successfully!');

        return Command::SUCCESS;
    }
}
