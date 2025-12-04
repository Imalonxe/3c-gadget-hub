<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_download_report_with_correct_format()
    {
        // Create admin user
        $admin = User::factory()->create(['is_admin' => true, 'user_type' => 'admin']);

        // Create data
        $category = Category::factory()->create(['category_name' => 'Electronics']);
        $product = Product::factory()->create([
            'category_id' => $category->category_id,
            'product_name' => 'Test Product',
            'price' => 1000
        ]);

        $order = Order::factory()->create([
            'user_id' => $admin->id,
            'total_amount' => 1000,
            'payment_status' => 'paid',
            'payment_method' => 'credit_card',
            'order_status' => 'delivered'
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->order_id,
            'product_id' => $product->product_id,
            'quantity' => 1,
            'unit_price' => 1000,
            'subtotal' => 1000
        ]);

        $response = $this->actingAs($admin)->get(route('admin.dashboard.report'));

        $response->assertStatus(200);
        $content = $response->content();

        // Check BOM
        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);

        // Check Headers
        $this->assertStringContainsString('Conversion Metrics', $content);
        $this->assertStringContainsString('Average Order Value (AOV)', $content);
        $this->assertStringContainsString('Sales Distribution - Payment Methods', $content);
        $this->assertStringContainsString('Sales Distribution - Order Status', $content);

        // Check Formatting (1,000.00) with tab prefix for Excel text mode
        $this->assertStringContainsString("\t1,000.00", $content);
        
        // Check Data
        $this->assertStringContainsString('Test Product', $content);
        $this->assertStringContainsString('Electronics', $content);
        $this->assertStringContainsString('credit_card', $content);
        $this->assertStringContainsString('delivered', $content);
    }
}
