<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('CREATE DATABASE IF NOT EXISTS 3c_gadget_hub_testing');
    echo "Database '3c_gadget_hub_testing' created successfully.\n";
} catch (PDOException $e) {
    echo "Error creating database: " . $e->getMessage() . "\n";
    exit(1);
}
