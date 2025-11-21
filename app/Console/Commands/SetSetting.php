<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Setting;

class SetSetting extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'settings:set {key} {value}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set a key/value in the settings table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $key = $this->argument('key');
        $value = $this->argument('value');

        Setting::set($key, $value);

        $this->info("Setting '$key' set.");

        return 0;
    }
}
