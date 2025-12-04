<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Http\Response as HttpResponse;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function dashboard(): Response
    {
        $stats = [
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_users' => User::count(),
        ];

        // Total revenue (only include paid orders)
        $totalRevenue = Order::where('payment_status', Order::PAYMENT_PAID)->sum('total_amount');

        // Revenue per day for the last 30 days (ensure zero values for missing days)
        $days = collect();
        $today = Carbon::today();
        for ($i = 29; $i >= 0; $i--) {
            $days->push($today->copy()->subDays($i)->toDateString());
        }

        $revenueRows = Order::where('payment_status', Order::PAYMENT_PAID)
            ->where('created_at', '>=', $today->copy()->subDays(29))
            ->get()
            ->groupBy(function($order) {
                return $order->created_at->format('Y-m-d');
            })
            ->map(function ($orders) {
                return (object) ['total' => $orders->sum('total_amount')];
            });

        $revenueTimeline = $days->map(function ($d) use ($revenueRows) {
            return [
                'date' => $d,
                'total' => isset($revenueRows[$d]) ? (float) $revenueRows[$d]->total : 0,
            ];
        })->values();

        // Top products by quantity sold
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->select('products.product_id', 'products.product_name', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.subtotal) as sales'))
            ->groupBy('products.product_id', 'products.product_name')
            ->orderByDesc('qty')
            ->limit(10)
            ->get();

        // Sales by category
        $categorySales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select('categories.category_id', 'categories.category_name as category_name', DB::raw('SUM(order_items.subtotal) as sales'))
            ->groupBy('categories.category_id', 'categories.category_name')
            ->orderByDesc('sales')
            ->get();

        // Low stock products (less than 5 items)
        $lowStockProducts = Product::where('stock_quantity', '<', 5)
            ->select('product_id', 'product_name', 'stock_quantity')
            ->orderBy('stock_quantity', 'asc')
            ->limit(10)
            ->get();

        $analytics = [
            'total_revenue' => (float) $totalRevenue,
            'revenue_timeline' => $revenueTimeline,
            'top_products' => $topProducts,
            'category_sales' => $categorySales,
            'low_stock_products' => $lowStockProducts,
        ];
        $activeAnnouncement = Announcement::active()->first();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'analytics' => $analytics,
            'activeAnnouncement' => $activeAnnouncement
        ]);
    }

    /**
     * Format a number for CSV to ensure it displays correctly in Excel (as text if needed).
     * Prepends a tab character to force text mode and prevent '#######' on narrow columns.
     */
    private function formatForCsv($number, $decimals = 0)
    {
        return "\t" . number_format($number, $decimals);
    }

    /**
     * Generate a one-click CSV report containing summary, timeline, top products and category sales.
     */
    public function downloadReport(Request $request): HttpResponse
    {
        // Reuse logic similar to dashboard but keep it compact for CSV
        $stats = [
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'total_users' => User::count(),
        ];

        $totalRevenue = Order::where('payment_status', Order::PAYMENT_PAID)->sum('total_amount');

        // Compute revenue per day for the last 30 days
        $revenueRows = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('orders.created_at', '>=', Carbon::today()->subDays(29))
            ->select(DB::raw('DATE(orders.created_at) as date'), DB::raw('SUM(order_items.subtotal) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->select('products.product_name', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.subtotal) as sales'))
            ->groupBy('products.product_id', 'products.product_name')
            ->orderByDesc('qty')
            ->limit(50)
            ->get();

        $categorySales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select('categories.category_name as category_name', DB::raw('SUM(order_items.subtotal) as sales'))
            ->groupBy('categories.category_id', 'categories.category_name')
            ->orderByDesc('sales')
            ->get();

        // --- New Metrics ---
        $aov = $stats['total_orders'] > 0 ? $totalRevenue / $stats['total_orders'] : 0;
        $arpu = $stats['total_users'] > 0 ? $totalRevenue / $stats['total_users'] : 0;
        $ordersPerUser = $stats['total_users'] > 0 ? $stats['total_orders'] / $stats['total_users'] : 0;

        $paymentMethods = Order::select('payment_method', DB::raw('count(*) as count'))
            ->groupBy('payment_method')
            ->get();

        $orderStatuses = Order::select('order_status', DB::raw('count(*) as count'))
            ->groupBy('order_status')
            ->get();

        // Build CSV content
        $lines = [];
        $lines[] = ["Admin Report - Generated: " . Carbon::now()->toDateTimeString()];
        $lines[] = [];

        // 1. Summary
        $lines[] = ['Summary'];
        $lines[] = ['Total Products', number_format($stats['total_products'])];
        $lines[] = ['Total Orders', number_format($stats['total_orders'])];
        $lines[] = ['Total Users', number_format($stats['total_users'])];
        $lines[] = ['Total Revenue', $this->formatForCsv($totalRevenue, 2)];
        $lines[] = [];

        // 2. Conversion Metrics (New)
        $lines[] = ['Conversion Metrics'];
        $lines[] = ['Average Order Value (AOV)', $this->formatForCsv($aov, 2)];
        $lines[] = ['Revenue per User (ARPU)', $this->formatForCsv($arpu, 2)];
        $lines[] = ['Orders per User', number_format($ordersPerUser, 2)];
        $lines[] = [];

        // 3. Sales Distribution (New)
        $lines[] = ['Sales Distribution - Payment Methods'];
        foreach ($paymentMethods as $pm) {
            $lines[] = [$pm->payment_method ?: 'Unknown', number_format($pm->count)];
        }
        $lines[] = [];

        $lines[] = ['Sales Distribution - Order Status'];
        foreach ($orderStatuses as $os) {
            $lines[] = [$os->order_status, number_format($os->count)];
        }
        $lines[] = [];

        // 4. Revenue Timeline
        $lines[] = ['Revenue Timeline (last 30 days)'];
        $lines[] = ['Date', 'Total Revenue'];
        foreach ($revenueRows as $row) {
            $total = (float) $row->total;
            if ($total <= 0) {
                continue;
            }
            $lines[] = ["'" . $row->date, $this->formatForCsv($total, 2)];
        }
        $lines[] = [];

        // 5. Top Products
        $lines[] = ['Top Products'];
        $lines[] = ['Product Name', 'Quantity Sold', 'Total Sales'];
        foreach ($topProducts as $p) {
            $lines[] = [$p->product_name, number_format($p->qty), $this->formatForCsv($p->sales, 2)];
        }
        $lines[] = [];

        // 6. Category Sales
        $lines[] = ['Category Sales'];
        $lines[] = ['Category', 'Total Sales'];
        foreach ($categorySales as $c) {
            $lines[] = [$c->category_name, $this->formatForCsv($c->sales, 2)];
        }

        // Convert to CSV string with BOM for Excel UTF-8 support
        $fh = fopen('php://temp', 'r+');
        fwrite($fh, "\xEF\xBB\xBF"); // Add BOM
        foreach ($lines as $row) {
            fputcsv($fh, $row);
        }
        rewind($fh);
        $csv = stream_get_contents($fh);
        fclose($fh);

        $filename = 'admin-report-' . Carbon::now()->format('Ymd_His') . '.csv';
        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
