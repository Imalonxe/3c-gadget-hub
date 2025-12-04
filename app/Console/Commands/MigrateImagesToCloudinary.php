<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\File;

class MigrateImagesToCloudinary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:images-to-cloudinary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Upload all files from local public storage to Cloudinary';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting image migration to Cloudinary...');

        $publicPath = storage_path('app/public');
        
        if (!File::exists($publicPath)) {
            $this->error("Public storage directory not found at: $publicPath");
            return 1;
        }

        $files = File::allFiles($publicPath);
        $total = count($files);
        $bar = $this->output->createProgressBar($total);

        $bar->start();

        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();
            // Normalize path separators to forward slashes
            $relativePath = str_replace('\\', '/', $relativePath);
            
            // Skip .gitignore or hidden files
            if (str_starts_with($file->getFilename(), '.')) {
                $bar->advance();
                continue;
            }

            try {
                // Upload to Cloudinary
                // We use the relative path (minus extension) as public_id to maintain structure
                // But Cloudinary adds extension automatically usually, or we can keep it.
                // Let's try to keep the path structure.
                
                $folder = dirname($relativePath);
                $filename = pathinfo($relativePath, PATHINFO_FILENAME);
                
                // If file is in root of public, folder is "."
                $options = [
                    'folder' => $folder === '.' ? '' : $folder,
                    'public_id' => $filename,
                    'overwrite' => true,
                    'resource_type' => 'auto'
                ];

                Cloudinary::upload($file->getRealPath(), $options);
                
            } catch (\Exception $e) {
                $this->error("\nFailed to upload $relativePath: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->info("\nMigration completed!");
        return 0;
    }
}
