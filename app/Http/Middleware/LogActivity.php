<?php

namespace App\Http\Middleware;

use App\Jobs\WriteActivityLog;
use Illuminate\Http\Request;
use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class LogActivity
{
    /**
     * Handle an incoming request.
     * Create a lightweight activity log for visits and server-side actions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Build basic info
        $path = $request->path();

        // Check excluded routes from config
        $excluded = config('activity-logs.excluded_routes', []);
        foreach ($excluded as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        // Optionally skip API if not enabled
        if (!config('activity-logs.record_api', true) && $request->is('api/*')) {
            return $next($request);
        }

        $response = $next($request);

        try {
            $user = $request->user();

            // Mask sensitive input
            $input = (array) $request->all();
            $maskedFields = config('activity-logs.masked_fields', []);
            foreach ($maskedFields as $field) {
                if (Arr::has($input, $field)) {
                    Arr::set($input, $field, '***masked***');
                }
            }

            $payload = [
                'user_id' => $user ? $user->id : null,
                'action' => 'visit',
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'meta' => [
                    'route' => $request->route() ? $request->route()->getName() : null,
                    'query' => $request->query(),
                    'payload' => $input,
                ],
            ];

            if (config('activity-logs.queue_write', true)) {
                dispatch(new WriteActivityLog($payload));
            } else {
                // fallback synchronous write
                \App\Models\ActivityLog::create($payload);
            }
        } catch (\Exception $e) {
            Log::warning('ActivityLog failed: ' . $e->getMessage());
        }

        return $response;
    }
}
