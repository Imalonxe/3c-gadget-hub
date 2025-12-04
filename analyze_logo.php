<?php
$sourcePath = 'vendor/symfony/error-handler/Resources/assets/images/Logo.jpg';

if (!file_exists($sourcePath)) {
    die("Source file not found: $sourcePath");
}

$im = imagecreatefromjpeg($sourcePath);
if (!$im) {
    die("Failed to load image");
}

$width = imagesx($im);
$height = imagesy($im);

echo "Image dimensions: $width x $height\n";

echo "Scanning first 50 pixels of row 0:\n";
for ($x = 0; $x < 50; $x++) {
    $rgb = imagecolorat($im, $x, 0);
    $r = ($rgb >> 16) & 0xFF;
    $g = ($rgb >> 8) & 0xFF;
    $b = $rgb & 0xFF;
    echo "($x,0): $r,$g,$b | ";
}
echo "\n";

imagedestroy($im);
?>
