<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Register the commands for the application.
     */
    protected function schedule(Schedule $schedule)
    {
        // Prune activity logs daily
        $schedule->command('activity-logs:prune')->daily();

        // Expire pending PromptPay orders every minute
        $schedule->command('orders:expire-promptpay')->everyMinute();

        // Backup database daily at 01:00
        $schedule->command('db:backup')->dailyAt('01:00');
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
    }
}
