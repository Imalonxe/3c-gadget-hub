<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backup the database to storage/app/backups';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filename = 'backup-' . Carbon::now()->format('Y-m-d-H-i-s') . '.sql';
        $directory = storage_path('app/backups');
        $path = $directory . '/' . $filename;
        
        // Ensure directory exists
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');
        $database = config('database.connections.mysql.database');
        $host = config('database.connections.mysql.host');

        // Try to find mysqldump
        // Default to just 'mysqldump' (assuming in PATH)
        $mysqldump = 'mysqldump';
        
        // Check common XAMPP path if on Windows
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            if (file_exists('c:/xampp/mysql/bin/mysqldump.exe')) {
                $mysqldump = 'c:/xampp/mysql/bin/mysqldump.exe';
            }
        }

        // Construct command
        // Note: Using --password="password" directly can be insecure in process list, 
        // but acceptable for this local/controlled environment context.
        // For empty password, mysqldump might prompt, so we handle that.
        $passwordArg = !empty($password) ? "--password=\"{$password}\"" : "";
        
        $command = "\"{$mysqldump}\" --user=\"{$username}\" {$passwordArg} --host=\"{$host}\" \"{$database}\" > \"{$path}\"";

        $this->info("Starting backup for database: {$database}...");
        
        $returnVar = null;
        $output = null;
        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            $this->error("Backup failed!");
            \Log::error("Database backup failed", ['command' => $command, 'return_var' => $returnVar, 'output' => $output]);
            return 1;
        }

        $this->info("Backup created successfully: {$filename}");
        \Log::info("Database backup created: {$filename}");

        // Cleanup old backups
        $this->cleanup($directory);
        
        return 0;
    }

    /**
     * Remove backups older than 7 days.
     */
    protected function cleanup($directory)
    {
        $files = glob($directory . '/*.sql');
        $now = time();
        $retention = 7 * 24 * 60 * 60; // 7 days

        foreach ($files as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= $retention) {
                    unlink($file);
                    $this->info("Deleted old backup: " . basename($file));
                }
            }
        }
    }
}
