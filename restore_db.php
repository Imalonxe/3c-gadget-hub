<?php
$backupFile = 'c:\xampp\htdocs\3c-gadget-hub\backup-2025-11-29-03-54-01 (1).sql';
$dbName = '3c-gadget_hub';
$user = 'root';
$pass = '';
$host = '127.0.0.1';

// Try to find mysql executable
$mysqlPaths = [
    'c:\xampp\mysql\bin\mysql.exe',
    'c:\xampp\mariadb\bin\mysql.exe',
];

$mysqlCmd = 'mysql'; // Default fallback
foreach ($mysqlPaths as $path) {
    if (file_exists($path)) {
        $mysqlCmd = $path;
        break;
    }
}

echo "Using MySQL: $mysqlCmd\n";

$command = sprintf('"%s" -u %s -h %s %s < "%s"', $mysqlCmd, $user, $host, $dbName, $backupFile);
echo "Executing: $command\n";

// Use shell_exec or exec
// Note: redirection < might need shell
$output = shell_exec($command . ' 2>&1');
echo "Output: $output\n";
