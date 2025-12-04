<?php
// Load the original image (assuming it's the white background one)
// If logo.jpg was overwritten with the checkerboard one, we might need to find the original again.
// But earlier I copied the vendor logo to logo.jpg. 
// Let's assume logo.jpg is still the one from vendor (white bg).
// If the user overwrote logo.jpg with the checkerboard one, this might fail.
// However, the user provided a NEW png file for the checkerboard one, so logo.jpg *should* be intact or I can re-copy it.

$sourcePath = 'public/images/logo.jpg';
$destPath = 'public/images/logo_fixed.png';

// Re-copy the original from vendor just to be safe and sure we have the white-bg version
copy('vendor/symfony/error-handler/Resources/assets/images/Logo.jpg', $sourcePath);

$im = imagecreatefromjpeg($sourcePath);
if (!$im) {
    die("Failed to load image");
}

$width = imagesx($im);
$height = imagesy($im);

// Create a new true color image with alpha channel
$newImg = imagecreatetruecolor($width, $height);

// Turn off alpha blending and turn on alpha saving
imagealphablending($newImg, false);
imagesavealpha($newImg, true);

// Create transparent color
$transparent = imagecolorallocatealpha($newImg, 255, 255, 255, 127);
imagefilledrectangle($newImg, 0, 0, $width, $height, $transparent);

// Loop through pixels
for ($x = 0; $x < $width; $x++) {
    for ($y = 0; $y < $height; $y++) {
        $rgb = imagecolorat($im, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;

        // Checkerboard removal logic
        // Dark square ~ 72, Light square ~ 102
        // We remove pixels that are grayscale (R~G~B) and within the checkerboard range
        
        $isGrayscale = (abs($r - $g) < 10) && (abs($g - $b) < 10);
        
        if ($isGrayscale) {
            // Check for dark square (around 72)
            if ($r > 60 && $r < 85) {
                imagesetpixel($newImg, $x, $y, $transparent);
                continue;
            }
            // Check for light square (around 102)
            if ($r > 90 && $r < 115) {
                imagesetpixel($newImg, $x, $y, $transparent);
                continue;
            }
            // Also remove white if present (just in case)
            if ($r > 240) {
                imagesetpixel($newImg, $x, $y, $transparent);
                continue;
            }
        }

        // Copy pixel, keeping it opaque
        $color = imagecolorallocatealpha($newImg, $r, $g, $b, 0);
        imagesetpixel($newImg, $x, $y, $color);
    }
}

// Save the image
imagepng($newImg, $destPath);
imagedestroy($im);
imagedestroy($newImg);

echo "Successfully created transparent logo at $destPath";
?>
