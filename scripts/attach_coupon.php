<?php
if ($argc < 3) {
    echo "Usage: php scripts/attach_coupon.php <user_id> <coupon_id>\n";
    exit(1);
}
$userId = (int)$argv[1];
$couponId = (int)$argv[2];
$path = __DIR__ . '/../database/database.sqlite';
if (!file_exists($path)) {
    echo "DB file not found: $path\n";
    exit(1);
}
try {
    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $now = (new DateTime())->format('Y-m-d H:i:s');
    $stmt = $pdo->prepare('INSERT INTO coupon_user (user_id, coupon_id, created_at, updated_at) VALUES (:user, :coupon, :now, :now)');
    $stmt->execute([':user' => $userId, ':coupon' => $couponId, ':now' => $now]);
    echo "Inserted coupon_user row for user_id={$userId} coupon_id={$couponId}\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(2);
}
