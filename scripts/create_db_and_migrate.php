<?php
// Usage: php create_db_and_migrate.php
// This script reads DB credentials from the project's .env file,
// attempts to connect to the MySQL server and CREATE DATABASE IF NOT EXISTS,
// then runs `php artisan migrate --force` and prints the output.

$root = dirname(__DIR__);
$envPath = $root . DIRECTORY_SEPARATOR . '.env';
if (! file_exists($envPath)) {
    fwrite(STDERR, "ERROR: .env not found at {$envPath}\n");
    exit(1);
}

$contents = file_get_contents($envPath);
$lines = preg_split('/\r?\n/', $contents);
$env = [];
foreach ($lines as $line) {
    if (trim($line) === '' || strpos(trim($line), '#') === 0) continue;
    if (! strpos($line, '=')) continue;
    [$k, $v] = explode('=', $line, 2);
    $k = trim($k);
    $v = trim($v);
    // remove surrounding quotes
    if ((str_starts_with($v, '"') && str_ends_with($v, '"')) || (str_starts_with($v, "'") && str_ends_with($v, "'"))) {
        $v = substr($v, 1, -1);
    }
    $env[$k] = $v;
}

$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = intval($env['DB_PORT'] ?? 3306);
$user = $env['DB_USERNAME'] ?? 'root';
$pass = $env['DB_PASSWORD'] ?? '';
$db   = $env['DB_DATABASE'] ?? null;

if (empty($db)) {
    fwrite(STDERR, "ERROR: DB_DATABASE not set in .env\n");
    exit(1);
}

fwrite(STDOUT, "Connecting to MySQL server {$host}:{$port} as {$user}...\n");
$mysqli = @new mysqli($host, $user, $pass, '', $port);
if ($mysqli->connect_error) {
    fwrite(STDERR, "ERROR: Could not connect to MySQL server: ({$mysqli->connect_errno}) {$mysqli->connect_error}\n");
    exit(1);
}

$safeDb = str_replace('`', '``', $db);
$createSql = "CREATE DATABASE IF NOT EXISTS `{$safeDb}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
fwrite(STDOUT, "Creating database `{$db}` if it does not exist...\n");
if ($mysqli->query($createSql) === false) {
    fwrite(STDERR, "ERROR: Failed to create database: " . $mysqli->error . "\n");
    exit(1);
}

fwrite(STDOUT, "Database ok. Running migrations...\n");

$php = defined('PHP_BINARY') ? PHP_BINARY : 'php';
$artisan = $root . DIRECTORY_SEPARATOR . 'artisan';
$cmd = escapeshellarg($php) . ' ' . escapeshellarg($artisan) . ' migrate --force 2>&1';

// Use proc_open so we can capture exit code reliably on Windows
$descriptors = [
    1 => ['pipe', 'w'],
    2 => ['pipe', 'w'],
];
$process = proc_open($cmd, $descriptors, $pipes, $root);
if (! is_resource($process)) {
    fwrite(STDERR, "ERROR: Could not execute artisan migrate command.\n");
    exit(1);
}

$output = '';
while (! feof($pipes[1])) {
    $output .= fgets($pipes[1]);
}
while (! feof($pipes[2])) {
    $output .= fgets($pipes[2]);
}

foreach ($pipes as $p) {
    @fclose($p);
}

$exit = proc_close($process);

fwrite(STDOUT, "--- artisan migrate output ---\n");
fwrite(STDOUT, $output . "\n");
fwrite(STDOUT, "--- exit code: {$exit} ---\n");

if ($exit !== 0) {
    fwrite(STDERR, "Migrations failed (exit code {$exit}).\n");
    exit($exit);
}

fwrite(STDOUT, "Migrations completed successfully.\n");
exit(0);
