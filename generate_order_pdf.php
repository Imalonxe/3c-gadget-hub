<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Use Eloquent to get an order
use App\Models\Order;
$order = Order::with(['user','items.product','shippingAddress'])->first();
if (! $order) {
    echo "No orders found to test.\n";
    exit(1);
}

// Ensure shipping_address relation mapping
if ($order->relationLoaded('shippingAddress')) {
    $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
}

$html = view('pdf.order_invoice', ['order' => $order])->render();

$dompdf = new Dompdf\Dompdf((new Dompdf\Options())->set('isRemoteEnabled', true));
$dompdf->loadHtml($html);
$dompdf->setPaper('A4','portrait');
$dompdf->render();

$outFile = __DIR__ . '/storage/app/order_export_test.pdf';
@mkdir(dirname($outFile),0777,true);
file_put_contents($outFile, $dompdf->output());

echo "Wrote order PDF to: $outFile\n";
