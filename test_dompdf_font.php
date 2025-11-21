<?php
require __DIR__ . '/vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$options = new Options();
$options->set('isRemoteEnabled', true);
$options->set('isFontSubsettingEnabled', true);
$dompdf = new Dompdf($options);

$fontPath = __DIR__ . '/public/fonts/NotoSansThai-Regular.ttf';
$fontBase64 = base64_encode(file_get_contents($fontPath));

$html = <<<HTML
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
@font-face {
    font-family: 'Noto Sans Thai';
    src: url("data:font/ttf;charset=utf-8;base64,{$fontBase64}") format('truetype');
}
body { font-family: 'Noto Sans Thai', DejaVu Sans, Arial, sans-serif; }
</style>
</head>
<body>
<h1>ทดสอบใบแจ้งหนี้</h1>
<div>Bill to: นายสมชาย ทดสอบ</div>
<p>ที่อยู่: 123 ถนนสุขุมวิท เขตคลองเตย กรุงเทพฯ 10110</p>
</body>
</html>
HTML;

$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$outFile = __DIR__ . '/storage/app/test_invoice.pdf';
@mkdir(dirname($outFile), 0777, true);
file_put_contents($outFile, $dompdf->output());

echo "Wrote PDF to: " . $outFile . PHP_EOL;
