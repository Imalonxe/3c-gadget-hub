<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ActivityLog;

class PruneActivityLogs extends Command
{
    protected $signature = 'activity-logs:prune {--days=}';
    protected $description = 'Prune activity logs older than configured retention days';

    public function handle()
    {
        $days = $this->option('days') ?: config('activity-logs.retention_days', 90);
        $cutoff = now()->subDays($days);
        $count = ActivityLog::where('created_at', '<', $cutoff)->delete();
        $this->info("Deleted {$count} activity logs older than {$days} days");
        return 0;
    }
}
