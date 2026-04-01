<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    use LogsActivity;
    /**
     * Display a listing of the orders.
     */
    public function index(Request $request): Response
    {
        $orders = Order::query()

            ->with(['user', 'items.product', 'mission'])
            ->when($request->search, function($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($request->status, function($query, $status) {
                // Map UI status to DB status
                $dbStatus = match($status) {
                    'pending' => Order::STATUS_PENDING_PAYMENT,
                    'shipped' => Order::STATUS_SHIPPING,
                    default => $status,
                };
                $query->where('order_status', $dbStatus);
            })
            ->when($request->payment_status, function($query, $paymentStatus) {
                $query->where('payment_status', $paymentStatus);
            })
            ->when($request->from_date, function($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->to_date, function($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment_status', 'from_date', 'to_date']),
            'statistics' => $this->getOrderStatistics()
        ]);
    }

    /**
     * Show the form for creating a new order.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Orders/Create');
    }

    /**
     * Store a newly created order in storage.
     */
    public function store(StoreOrderRequest $request)
    {
        $order = Order::create($request->validated());
        
        // Create order items
        foreach ($request->items as $item) {
            $order->items()->create($item);
            
            // Update product stock
            $product = Product::find($item['product_id']);
            $product->decrement('stock_quantity', $item['quantity']);
        }

        // Calculate totals
        $order->calculateTotals();

        return redirect()
            ->route('admin.orders.edit', $order->order_id)
            ->with('success', 'Order created successfully.');
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): Response
    {
        $order->load([
            'user',
            'items.product',
            'transactions' => function($query) {
                $query->latest();
            },
            'shippingAddress'
        ]);

        if ($order->relationLoaded('shippingAddress')) {
            $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
        }

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order
        ]);
    }

    /**
     * Export an order as a PDF invoice.
     */
    public function exportPdf(Order $order)
    {
        // Log order export
        $this->logActivity('export_order_pdf', [
            'order_id' => $order->order_id,
            'order_number' => $order->order_number,
            'user_type' => 'admin',
        ]);

        return $this->generatePdfResponse($order);
    }

    /**
     * Allow a regular authenticated user (owner of the order) to export the admin-style invoice
     * but only if the order payment_status is 'paid'.
     */
    public function userExportPdf(Order $order)
    {
        // Use Policy for authorization instead of manual checks
        $this->authorize('view', $order);

        // Only allow export when payment status is paid
        if ($order->payment_status !== Order::PAYMENT_PAID) {
            abort(403, 'Order must be paid before exporting invoice');
        }

        // Log user order export
        $this->logActivity('export_order_pdf', [
            'order_id' => $order->order_id,
            'order_number' => $order->order_number,
            'user_type' => 'customer',
        ]);

        return $this->generatePdfResponse($order);
    }

    /**
     * Internal helper to generate the PDF response for an order. Used by both admin and user exports.
     */
    protected function generatePdfResponse(Order $order)
    {
        $order->load(['user', 'items.product', 'shippingAddress']);

        // Map shippingAddress relation name to shipping_address for views consistency
        if ($order->relationLoaded('shippingAddress')) {
            $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
        }

        // Use mPDF (namespaced v8+) to render the Blade view to PDF with a registered Thai-capable font.
        $html = view('pdf.order_invoice', ['order' => $order])->render();

        // Get default font directories and font data from mPDF config
        $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        // Try creating mPDF with the registered Noto Sans Thai font (with OTL). If the font
        // triggers an mPDF exception (some fonts contain MarkGlyphSets not tested), fall back
        // to the built-in 'garuda' font which ships with mPDF and supports Thai.
        try {
            $mpdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'fontDir' => array_merge($fontDirs, [public_path('fonts')]),
                'fontdata' => $fontData + [
                    'notosansthai' => [
                        'R' => 'NotoSansThai-Regular.ttf',
                        'B' => 'NotoSansThai-Bold.ttf',
                        // Enable OpenType layout features (required for Thai shaping)
                        'useOTL' => 0xFF,
                    ],
                ],
                'default_font' => 'notosansthai'
            ]);

            $mpdf->WriteHTML($html);
            $filename = sprintf('invoice-%s.pdf', $order->order_number);
            $pdfContent = $mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN);
        } catch (\Mpdf\MpdfException $e) {
            // Log and try fallback to built-in garuda font (mPDF includes Garuda in ttfonts)
            \Log::warning('mPDF font error, falling back to garuda: ' . $e->getMessage());

            $mpdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'default_font' => 'garuda',
            ]);

            $mpdf->WriteHTML($html);
            $filename = sprintf('invoice-%s.pdf', $order->order_number);
            $pdfContent = $mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN);
        }

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($pdfContent),
        ]);
    }

    /**
     * Export shipping label PDF.
     */
    public function exportShippingLabel(Order $order)
    {
        // Log export
        $this->logActivity('export_shipping_label', [
            'order_id' => $order->order_id,
            'order_number' => $order->order_number,
            'user_type' => 'admin',
        ]);

        $order->load(['user', 'items.product', 'shippingAddress']);

        if ($order->relationLoaded('shippingAddress')) {
            $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
        }

        $html = view('pdf.shipping_label', ['order' => $order])->render();

        // Setup mPDF
        $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];
        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        try {
            $mpdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4', // Standard A4
                'fontDir' => array_merge($fontDirs, [public_path('fonts')]),
                'fontdata' => $fontData + [
                    'notosansthai' => [
                        'R' => 'NotoSansThai-Regular.ttf',
                        'B' => 'NotoSansThai-Bold.ttf',
                        'useOTL' => 0xFF,
                    ],
                ],
                'default_font' => 'notosansthai'
            ]);

            $mpdf->WriteHTML($html);
            $filename = sprintf('label-%s.pdf', $order->order_number);
            $pdfContent = $mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN);

        } catch (\Exception $e) {
            \Log::warning('mPDF error in shipping label: ' . $e->getMessage());
            // Fallback
            $mpdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'default_font' => 'garuda',
            ]);
            $mpdf->WriteHTML($html);
            $filename = sprintf('label-%s.pdf', $order->order_number);
            $pdfContent = $mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN);
        }

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"', // Inline to open in browser tab
        ]);
    }

    /**
     * Show the edit form for the order (admin).
     */
    public function edit(Order $order): Response
    {
        $order->load(['user', 'items.product', 'shippingAddress']);

        if ($order->relationLoaded('shippingAddress')) {
            $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
        }

        return Inertia::render('Admin/Orders/Edit', [
            'order' => $order
        ]);
    }

    /**
     * Update the order (status / shipping / payment).
     */
    public function update(UpdateOrderRequest $request, Order $order)
    {
        $data = $request->validated();

        // Capture old status so we can notify if it changed
        $oldStatus = $order->order_status;

        // Allow UI-friendly 'status' values because Order model maps them via mutator
        if (isset($data['status'])) {
            $order->status = $data['status'];
        }

        if (isset($data['payment_status'])) {
            $order->payment_status = $data['payment_status'];
        }

        if (isset($data['shipping_method'])) {
            $order->shipping_method = $data['shipping_method'];
        }

        if (isset($data['shipping_fee'])) {
            $order->shipping_fee = $data['shipping_fee'];
        }

        if (array_key_exists('tracking_number', $data)) {
            $order->tracking_number = $data['tracking_number'];
        }

        if (array_key_exists('notes', $data)) {
            $order->notes = $data['notes'];
        }

        $order->save();

        // Notifications for status changes are handled by the Order model observer
        // to ensure the user is notified regardless of where the status was changed.

        return redirect()->route('admin.orders.edit', $order->order_id)
            ->with('success', 'Order updated successfully.');
    }

    /**
     * Update the specified order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        // Accept both DB enum values and UI-friendly values (e.g. 'pending' and 'pending_payment')
        $allowed = [
            Order::STATUS_PENDING_PAYMENT,
            'pending',
            Order::STATUS_PROCESSING,
            Order::STATUS_SHIPPING,
            'shipped',
            Order::STATUS_DELIVERED,
            Order::STATUS_CANCELLED,
            Order::STATUS_REFUNDED,
            'processing',
        ];

        $request->validate([
            'status' => ['required', 'string', 'in:' . implode(',', $allowed)]
        ]);

        $oldStatus = $order->status;
        // Use the model mutator setStatusAttribute to map UI values to DB values
        $order->update(['status' => $request->status]);

        // Refresh model to ensure DB values are available (mutator mapped UI -> DB)
        $order->refresh();

        // Log status update
        $this->logActivity('update_order_status', [
            'order_id' => $order->order_id,
            'order_number' => $order->order_number,
            'old_status' => $oldStatus,
            'new_status' => $order->status,
        ]);

        // Handle status-specific actions using DB values
        switch ($order->order_status) {
            case Order::STATUS_SHIPPING:
                // Any status-specific side-effects (e.g. logging) can go here.
                // The actual notification is performed by the model observer.
                break;
            case Order::STATUS_DELIVERED:
                // Delivery-specific side-effects may go here. Notification
                // is handled centrally by the Order model observer.

                // Track Revenue for Mission
                if ($order->mission_id && $order->payment_status === Order::PAYMENT_PAID) {
                    \App\Models\MissionAnalytics::firstOrCreate(
                        ['mission_id' => $order->mission_id, 'date' => now()->toDateString()],
                        ['views' => 0, 'completions' => 0, 'revenue' => 0]
                    )->increment('revenue', $order->total_amount);
                }
                break;
            case Order::STATUS_CANCELLED:
                // Restore product stock
                foreach ($order->items as $item) {
                    $item->product->increment('stock_quantity', $item->quantity);
                }
                break;
        }

        return back()->with('success', "Order status updated from {$oldStatus} to {$order->status}.");
    }

    /**
     * Update shipping information.
     */
    public function updateShipping(Request $request, Order $order)
    {
        $request->validate([
            'tracking_number' => ['required', 'string', 'max:255'],
            'shipping_method' => ['required', 'string', 'max:255'],
        ]);

        $order->update($request->validated());

        $this->logActivity('update_order_shipping', [
            'order_id' => $order->order_id,
            'order_number' => $order->order_number,
            'tracking_number' => $request->tracking_number,
            'shipping_method' => $request->shipping_method,
        ]);

        return back()->with('success', 'Shipping information updated successfully.');
    }

    /**
     * Display user's orders.
     */
    public function userOrders(Request $request): Response
    {
        $orders = Order::where('user_id', auth()->id())
            ->where('order_status', '!=', Order::STATUS_CANCELLED) // Exclude cancelled orders from user view
            ->with(['items.product', 'items.product.images' => function($query) {
                $query->primary();
            }])
            ->select('orders.*') // Ensure we get all order fields including payment_method
            ->when($request->search, function($query, $search) {
                $query->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('items.product', function($q) use ($search) {
                          $q->where('product_name', 'like', "%{$search}%");
                      });
            })
            ->when($request->from_date, function($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->to_date, function($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'from_date', 'to_date'])
        ]);
    }

    /**
     * Display user's order details.
     */
    public function userOrderDetails(Order $order): Response
    {
        // Check if order belongs to current user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        $order->load([
            'items.product',
            'items.product.images' => function($query) {
                $query->primary();
            },
            'transactions' => function($query) {
                $query->latest();
            },
            'shippingAddress'
        ]);

        if ($order->relationLoaded('shippingAddress')) {
            $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
        }

        return Inertia::render('User/Orders/Show', [
            'order' => $order
        ]);
    }

    /**
     * Bulk update order status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:orders,order_id'],
            'status' => ['required', 'string'],
        ]);

        $count = 0;
        foreach ($request->ids as $id) {
            $order = Order::find($id);
            if ($order) {
                // Use updateStatus logic to handle side effects if needed, 
                // or just update directly if side effects are handled by observers.
                // For simplicity and consistency with updateStatus, we'll update directly
                // and let the observer handle notifications.
                // Use 'status' attribute to trigger the mutator in Order model
                // which handles mapping (e.g. 'shipped' -> 'shipping')
                $order->update(['status' => $request->status]);
                $count++;
            }
        }

        $this->logActivity('bulk_update_order_status', [
            'count' => $count,
            'new_status' => $request->status,
            'order_ids' => $request->ids
        ]);

        return back()->with('success', "{$count} orders updated successfully.");
    }

    /**
     * Bulk export orders as PDF.
     */
    public function bulkExportPdf(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:orders,order_id'],
        ]);

        $orders = Order::whereIn('order_id', $request->ids)
            ->with(['user', 'items.product', 'shippingAddress'])
            ->get();

        if ($orders->isEmpty()) {
            return back()->with('error', 'No orders found.');
        }

        // Setup mPDF
        $defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];
        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        try {
            $mpdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'fontDir' => array_merge($fontDirs, [public_path('fonts')]),
                'fontdata' => $fontData + [
                    'notosansthai' => [
                        'R' => 'NotoSansThai-Regular.ttf',
                        'B' => 'NotoSansThai-Bold.ttf',
                        'useOTL' => 0xFF,
                    ],
                ],
                'default_font' => 'notosansthai'
            ]);
        } catch (\Exception $e) {
            // Fallback
            $mpdf = new \Mpdf\Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'default_font' => 'garuda',
            ]);
        }

        foreach ($orders as $index => $order) {
            // Map relation for view
            if ($order->relationLoaded('shippingAddress')) {
                $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
            }

            $html = view('pdf.order_invoice', ['order' => $order])->render();
            $mpdf->WriteHTML($html);

            // Add page break if not the last order
            if ($index < $orders->count() - 1) {
                $mpdf->AddPage();
            }
        }

        $filename = 'bulk-invoices-' . now()->format('Ymd_His') . '.pdf';
        $pdfContent = $mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN);

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($pdfContent),
        ]);
    }

    /**
     * Cancel user's order.
     */
    public function cancel(Order $order)
    {
        // Check if order belongs to current user
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if order can be cancelled (use DB column)
        if (!in_array($order->order_status, [Order::STATUS_PENDING_PAYMENT, Order::STATUS_PROCESSING])) {
            return back()->with('error', 'This order cannot be cancelled.');
        }

        // Load items with their products
        $order->load('items.product');

        // Restore product stock
        foreach ($order->items as $item) {
            if ($item->product_id && $item->product) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }

        // Update order status to cancelled (use order_status directly to ensure correct DB value)
        $order->update(['order_status' => Order::STATUS_CANCELLED]);

        // Log order cancellation
        $this->logActivity('cancel_order', [
            'order_id' => $order->order_id,
            'order_number' => $order->order_number,
        ]);

        return back()->with('success', 'Order cancelled successfully.');
    }

    /**
     * Get order statistics.
     */
    private function getOrderStatistics(): array
    {
        return [
            'total' => Order::count(),
            'pending' => Order::status(Order::STATUS_PENDING)->count(),
            'processing' => Order::status(Order::STATUS_PROCESSING)->count(),
            'shipped' => Order::status(Order::STATUS_SHIPPED)->count(),
            'delivered' => Order::status(Order::STATUS_DELIVERED)->count(),
            'cancelled' => Order::status(Order::STATUS_CANCELLED)->count(),
            'refunded' => Order::status(Order::STATUS_REFUNDED)->count(),
            'today_sales' => Order::whereDate('created_at', today())
                ->where('payment_status', Order::PAYMENT_PAID)
                ->sum('total_amount'),
            'month_sales' => Order::whereMonth('created_at', now()->month)
                ->where('payment_status', Order::PAYMENT_PAID)
                ->sum('total_amount'),
        ];
    }
}