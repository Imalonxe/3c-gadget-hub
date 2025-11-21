<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
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
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

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

        $analytics = [
            'total_revenue' => (float) $totalRevenue,
            'revenue_timeline' => $revenueTimeline,
            'top_products' => $topProducts,
            'category_sales' => $categorySales,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'analytics' => $analytics,
        ]);
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

        // Compute revenue per day for the last 30 days by summing order_items.subtotal
        // grouped by the order's created_at date. This mirrors the topProducts/categorySales
        // approach and ensures we include actual sold item subtotals even when orders
        // may have differing payment_status values.
        $revenueRows = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.order_id')
            ->where('orders.created_at', '>=', Carbon::today()->subDays(29))
            ->select(DB::raw('DATE(orders.created_at) as date'), DB::raw('SUM(order_items.subtotal) as total'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->select('products.product_id', 'products.product_name', DB::raw('SUM(order_items.quantity) as qty'), DB::raw('SUM(order_items.subtotal) as sales'))
            ->groupBy('products.product_id', 'products.product_name')
            ->orderByDesc('qty')
            ->limit(50)
            ->get();

        $categorySales = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.product_id')
            ->join('categories', 'products.category_id', '=', 'categories.category_id')
            ->select('categories.category_id', 'categories.category_name as category_name', DB::raw('SUM(order_items.subtotal) as sales'))
            ->groupBy('categories.category_id', 'categories.category_name')
            ->orderByDesc('sales')
            ->get();

        // Build CSV content
        $lines = [];
        $lines[] = ["Admin Report - Generated: " . Carbon::now()->toDateTimeString()];
        $lines[] = [];
        $lines[] = ['Summary'];
        $lines[] = ['Total Products', $stats['total_products']];
        $lines[] = ['Total Orders', $stats['total_orders']];
        $lines[] = ['Total Users', $stats['total_users']];
        $lines[] = ['Total Revenue', (float) $totalRevenue];
        $lines[] = [];
        $lines[] = ['Revenue Timeline (last 30 days)'];
        $lines[] = ['date', 'total'];

        // Output only days that have sales (exclude zero rows). Prefix dates with
        // a single quote so Excel treats them as text and avoids auto-formatting issues.
        foreach ($revenueRows as $row) {
            $total = (float) $row->total;
            if ($total <= 0) {
                continue;
            }
            $lines[] = ["'" . $row->date, $total];
        }
        $lines[] = [];
        $lines[] = ['Top Products'];
        $lines[] = ['product_id', 'product_name', 'quantity_sold', 'sales'];
        foreach ($topProducts as $p) {
            $lines[] = [$p->product_id, $p->product_name, (int) $p->qty, (float) $p->sales];
        }
        $lines[] = [];
        $lines[] = ['Category Sales'];
        $lines[] = ['category_id', 'category_name', 'sales'];
        foreach ($categorySales as $c) {
            $lines[] = [$c->category_id, $c->category_name, (float) $c->sales];
        }

        // Convert to CSV string
        $fh = fopen('php://temp', 'r+');
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
