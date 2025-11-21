<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'key', 'value'
    ];

    public $timestamps = true;

    /**
     * Get a setting value by key with optional default.
     */
    public static function get(string $key, $default = null)
    {
        try {
            $s = static::where('key', $key)->first();
        } catch (\Illuminate\Database\QueryException $e) {
            // Database or table doesn't exist yet (installer/migrations not run).
            // Return the provided default so callers don't trigger a 500.
            return $default;
        } catch (\Exception $e) {
            // Catch any other DB related exception and return default to avoid
            // surfacing errors in pages that are expected to work before install.
            return $default;
        }

        if (!$s) return $default;
        return $s->value;
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value)
    {
        try {
            return static::updateOrCreate(['key' => $key], ['value' => $value]);
        } catch (\Illuminate\Database\QueryException $e) {
            // If DB/table isn't available yet, return null/false so callers can
            // handle it without a crash. Installer can perform the write after
            // migrations are applied.
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
}
