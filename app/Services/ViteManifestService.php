<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class ViteManifestService
{
    private static $manifest = null;

    public static function getManifest()
    {
        if (self::$manifest === null) {
            $manifestPath = public_path('build/manifest.json');
            
            if (!File::exists($manifestPath)) {
                return [];
            }

            $content = File::get($manifestPath);
            self::$manifest = json_decode($content, true) ?? [];
        }

        return self::$manifest;
    }

    public static function getAssetUrl($entry)
    {
        $manifest = self::getManifest();
        
        if (!isset($manifest[$entry])) {
            return null;
        }

        $file = $manifest[$entry]['file'];
        $url = 'build/' . $file;
        
        // Use absolute URL for HTTPS compatibility with Cloudflare
        if (request()->isSecure() || env('APP_ENV') === 'production') {
            return secure_asset($url);
        }
        
        return asset($url);
    }

    public static function getCssFiles($entry)
    {
        $manifest = self::getManifest();
        
        if (!isset($manifest[$entry])) {
            return [];
        }

        return $manifest[$entry]['css'] ?? [];
    }

    public static function getCssUrl($cssFile)
    {
        $url = 'build/' . $cssFile;
        
        // Use absolute URL for HTTPS compatibility with Cloudflare
        if (request()->isSecure() || env('APP_ENV') === 'production') {
            return secure_asset($url);
        }
        
        return asset($url);
    }
}
