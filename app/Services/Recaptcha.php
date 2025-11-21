<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class Recaptcha
{
    /**
     * Verify a reCAPTCHA token with Google's API and return the raw response body.
     *
     * @param string|null $token
     * @param string|null $remoteIp
     * @return array|null
     */
    public static function verify(?string $token, ?string $remoteIp = null): ?array
    {
        if (empty($token) || empty(config('services.recaptcha.secret'))) {
            return null;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret'),
                'response' => $token,
                'remoteip' => $remoteIp,
            ]);

            if (! $response->successful()) {
                return null;
            }

            return $response->json();
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Convenience check for reCAPTCHA v3: verify token and ensure score/action pass thresholds.
     *
     * @param string|null $token
     * @param string|null $action
     * @param float $minScore
     * @return bool
     */
    public static function passesV3(?string $token, ?string $action = null, float $minScore = 0.5): bool
    {
        $body = self::verify($token);
        if (! $body || empty($body['success'])) {
            return false;
        }

        // If action is provided, ensure it matches
        if ($action && isset($body['action']) && $body['action'] !== $action) {
            return false;
        }

        // If score present, ensure it's above threshold
        if (isset($body['score'])) {
            return (float) $body['score'] >= $minScore;
        }

        // If no score provided, fall back to success boolean
        return true;
    }
}
