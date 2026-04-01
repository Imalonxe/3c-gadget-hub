<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Notification::fake();
    }

    public function test_calculate_totals_updates_order_amounts_correctly()
    {
        $order = Order::factory()->create();
        $product1 = Product::factory()->create(['price' => 100]);
        $product2 = Product::factory()->create(['price' => 200]);

        OrderItem::factory()->create([
            'order_id' => $order->order_id,
            'product_id' => $product1->product_id,
            'quantity' => 2,
            'unit_price' => 100
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->order_id,
            'product_id' => $product2->product_id,
            'quantity' => 1,
            'unit_price' => 200
        ]);

        // Subtotal = (100 * 2) + (200 * 1) = 400
        // Tax (7%) = 400 * 0.07 = 28
        // Shipping = 0 (default)
        // Total = 428

        $order->calculateTotals();

        $this->assertEquals(400, $order->subtotal);
        $this->assertEquals(28, $order->tax);
        $this->assertEquals(428, $order->total_amount);
    }

    public function test_status_mutator_maps_ui_status_to_db_status()
    {
        $order = Order::factory()->create();

        // Test 'pending' -> STATUS_PENDING_PAYMENT
        $order->status = 'pending';
        $this->assertEquals(Order::STATUS_PENDING_PAYMENT, $order->order_status);

        // Test 'shipped' -> STATUS_SHIPPING
        $order->status = 'shipped';
        $this->assertEquals(Order::STATUS_SHIPPING, $order->order_status);
    }

    public function test_cancel_changes_status_to_cancelled()
    {
        $order = Order::factory()->create(['order_status' => Order::STATUS_PENDING_PAYMENT]);

        $order->cancel();

        $this->assertEquals(Order::STATUS_CANCELLED, $order->order_status);
    }

    public function test_refund_changes_status_to_refunded()
    {
        $order = Order::factory()->create(['order_status' => Order::STATUS_DELIVERED]);

        $order->refund();

        $this->assertEquals(Order::STATUS_REFUNDED, $order->order_status);
    }

    public function test_can_cancel_returns_true_only_for_pending_orders()
    {
        $pendingOrder = Order::factory()->create(['order_status' => Order::STATUS_PENDING_PAYMENT]);
        $shippedOrder = Order::factory()->create(['order_status' => Order::STATUS_SHIPPING]);

        $this->assertTrue($pendingOrder->canCancel());
        $this->assertFalse($shippedOrder->canCancel());
    }
}
