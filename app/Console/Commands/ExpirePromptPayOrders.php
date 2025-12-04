<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ExpirePromptPayOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:expire-promptpay';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire pending PromptPay orders older than 15 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired PromptPay orders...');

        $expiredOrders = Order::where('payment_status', Order::PAYMENT_PENDING)
            ->where('payment_method', 'promptpay')
            ->where('created_at', '<', Carbon::now()->subMinutes(15))
            ->get();

        $count = $expiredOrders->count();
        $this->info("Found {$count} expired orders.");

        foreach ($expiredOrders as $order) {
            try {
                DB::beginTransaction();

                // Load items to restore stock
                $order->load('items');

                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        $product = \App\Models\Product::find($item->product_id);
                        if ($product) {
                            $product->increment('stock_quantity', $item->quantity);
                        }
                    }
                }

                // Delete the order
                $order->delete();

                Log::info("Expired PromptPay order #{$order->order_number} (ID: {$order->order_id}) due to timeout.");

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to expire order #{$order->order_number}: " . $e->getMessage());
                $this->error("Failed to expire order #{$order->order_number}");
            }
        }

        $this->info('Done.');
    }
}
