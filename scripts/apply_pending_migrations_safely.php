<?php

// Script to safely apply pending migrations in a Laravel project
// - Parses .env for DB credentials
// - Scans database/migrations for files
// - For each migration not recorded in migrations table:
//    - If it creates one or more tables that already exist, mark migration as run (insert into migrations table)
//    - Otherwise run php artisan migrate --path=thatfile --force
// Prints a summary at the end.

$root = realpath(__DIR__ . '/..');
putenv('APP_ENV=local');

function envVar($name, $default = null) {
    $path = __DIR__ . '/../.env';
    if (!file_exists($path)) return $default;
    $contents = file_get_contents($path);
    if (preg_match('/^' . preg_quote($name) . '=(.*)$/m', $contents, $m)) {
        return trim(trim($m[1]), " \t\"\'\r\n");
    }
    return $default;
}

$dbHost = envVar('DB_HOST', '127.0.0.1');
$dbPort = envVar('DB_PORT', '3306');
$dbName = envVar('DB_DATABASE', 'forge');
$dbUser = envVar('DB_USERNAME', 'root');
$dbPass = envVar('DB_PASSWORD', '');

echo "Using DB: {$dbUser}@{$dbHost}:{$dbPort}/{$dbName}\n";

$mysqli = new mysqli($dbHost, $dbUser, $dbPass, $dbName, (int)$dbPort);
if ($mysqli->connect_errno) {
    fwrite(STDERR, "Failed to connect to MySQL: ({$mysqli->connect_errno}) {$mysqli->connect_error}\n");
    exit(1);
}

// get current migrations recorded
$migrationsRecorded = [];
$res = $mysqli->query("SELECT migration, batch FROM migrations");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $migrationsRecorded[$row['migration']] = (int)$row['batch'];
    }
    $res->free();
}
// get max batch
$maxBatch = 0;
foreach ($migrationsRecorded as $b) { if ($b > $maxBatch) $maxBatch = $b; }
if ($maxBatch === 0) $maxBatch = 1;
$nextBatch = $maxBatch + 1;

$migDir = $root . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations';
$files = array_values(array_filter(scandir($migDir), function($f){ return preg_match('/\.php$/', $f); }));
sort($files);

$summary = ['ran'=>[], 'marked'=>[], 'skipped'=>[], 'failed'=>[]];

foreach ($files as $file) {
    $path = $migDir . DIRECTORY_SEPARATOR . $file;
    $migrationName = pathinfo($file, PATHINFO_FILENAME);
    if (isset($migrationsRecorded[$migrationName])) {
        // already recorded
        continue;
    }

    echo "Processing migration: {$file}\n";
    $contents = file_get_contents($path);
    // find Schema::create('table') occurrences
    preg_match_all("/Schema::create\(\s*'([a-z0-9_]+)'/i", $contents, $mCreates);
    $createdTables = array_unique(array_map('strtolower', $mCreates[1] ?? []));

    $allExist = true;
    foreach ($createdTables as $t) {
        $q = $mysqli->real_escape_string($t);
        $r = $mysqli->query("SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = '" . $mysqli->real_escape_string($dbName) . "' AND table_name = '{$q}'");
        $row = $r ? $r->fetch_assoc() : null;
        $exists = $row && intval($row['cnt']) > 0;
        echo " - create target table '{$t}' exists? ".($exists?"yes":"no")."\n";
        if (!$exists) $allExist = false;
    }

    if (!empty($createdTables) && $allExist) {
        // mark as run (insert into migrations)
        $migrationEsc = $mysqli->real_escape_string($migrationName);
        $sql = "INSERT INTO migrations (migration, batch) VALUES ('{$migrationEsc}', {$nextBatch})";
        if ($mysqli->query($sql)) {
            echo " -> Marked as run (all created tables already exist): {$migrationName}\n";
            $summary['marked'][] = $migrationName;
            $nextBatch++;
            continue;
        } else {
            echo " -> Failed to mark migration as run: {$mysqli->error}\n";
            $summary['failed'][$migrationName] = $mysqli->error;
            continue;
        }
    }

    // otherwise run this single migration by path
    echo " -> Running migration file via artisan: {$file}\n";
    $cmd = "php " . escapeshellarg($root . DIRECTORY_SEPARATOR . 'artisan') . " migrate --path=database/migrations/" . escapeshellarg($file) . " --force";
    // escapeshellarg will add quotes around file and the path becomes database/migrations/'file.php' which Laravel accepts.
    // Instead build full path without extra quoting for the path parameter
    $cmd = "php " . escapeshellarg($root . DIRECTORY_SEPARATOR . 'artisan') . " migrate --path=database/migrations/{$file} --force";
    echo "Running: {$cmd}\n";
    passthru($cmd, $ret);
    if ($ret === 0) {
        echo " -> Migration ran successfully: {$migrationName}\n";
        $summary['ran'][] = $migrationName;
    } else {
        echo " -> Migration FAILED with exit code {$ret}: {$migrationName}\n";
        $summary['failed'][$migrationName] = $ret;
        // continue to next (do not abort)
    }
}

echo "\nSummary:\n";
echo "Ran: " . implode(', ', $summary['ran']) . "\n";
echo "Marked as run: " . implode(', ', $summary['marked']) . "\n";
echo "Failed: " . (empty($summary['failed'])? 'none' : print_r($summary['failed'], true)) . "\n";

exit(0);
