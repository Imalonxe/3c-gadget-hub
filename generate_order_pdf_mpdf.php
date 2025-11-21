<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;

$order = Order::with(['user','items.product','shippingAddress'])->first();
if (! $order) {
    echo "No orders found to test.\n";
    exit(1);
}

if ($order->relationLoaded('shippingAddress')) {
    $order->setRelation('shipping_address', $order->getRelation('shippingAddress'));
}

$html = view('pdf.order_invoice', ['order' => $order])->render();

$defaultConfig = (new \Mpdf\Config\ConfigVariables())->getDefaults();
$fontDirs = $defaultConfig['fontDir'];

$defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();
$fontData = $defaultFontConfig['fontdata'];

$outFile = __DIR__ . '/storage/app/order_export_test_mpdf.pdf';
@mkdir(dirname($outFile),0777,true);

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

    $mpdf->WriteHTML($html);
    file_put_contents($outFile, $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN));
} catch (\Mpdf\MpdfException $e) {
    echo "mPDF font error, falling back to garuda: " . $e->getMessage() . "\n";
    $mpdf = new \Mpdf\Mpdf(['mode' => 'utf-8', 'format' => 'A4', 'default_font' => 'garuda']);
    $mpdf->WriteHTML($html);
    file_put_contents($outFile, $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN));
}

echo "Wrote order PDF (mPDF) to: $outFile\n";
