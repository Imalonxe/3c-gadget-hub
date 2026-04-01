<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

use App\Traits\LogsActivity;

class BackupController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the backups.
     */
    public function index()
    {
        $files = glob(storage_path('app/backups/*.sql'));
        $backups = [];

        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => $this->formatBytes(filesize($file)),
                'created_at' => Carbon::createFromTimestamp(filemtime($file))->format('Y-m-d H:i:s'),
                'timestamp' => filemtime($file), // for sorting
            ];
        }

        // Sort by newest first
        usort($backups, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return Inertia::render('Admin/Backups/Index', [
            'backups' => $backups,
        ]);
    }

    /**
     * Create a new backup.
     */
    public function store()
    {
        try {
            $exitCode = Artisan::call('db:backup');

            if ($exitCode === 0) {
                $this->logActivity('create_backup', []);
                return back()->with('success', 'Backup created successfully.');
            } else {
                return back()->with('error', 'Backup failed. Check logs for details.');
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    /**
     * Download a backup file.
     */
    public function download($filename)
    {
        $path = storage_path('app/backups/' . $filename);

        if (!file_exists($path)) {
            return back()->with('error', 'Backup file not found.');
        }

        return response()->download($path);
    }

    /**
     * Remove the specified backup file.
     */
    public function destroy($filename)
    {
        $path = storage_path('app/backups/' . $filename);

        if (file_exists($path)) {
            unlink($path);
            
            $this->logActivity('delete_backup', [
                'filename' => $filename
            ]);

            return back()->with('success', 'Backup deleted successfully.');
        }

        return back()->with('error', 'Backup file not found.');
    }

    /**
     * Format bytes to human readable string.
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        // Calculate bytes /= (1 << (10 * $pow))
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
