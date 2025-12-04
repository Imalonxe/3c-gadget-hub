<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use App\Jobs\WriteActivityLog;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);
        // Share session flash messages with all Inertia responses so frontend
        // layouts (like AdminLayout) can display backend toasts consistently.
        Inertia::share([
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },
        ]);

        // Diagnostic: listen for any direct inserts into the coupon_user pivot
        // This helps identify which request/command is creating rows unexpectedly.
        // Enable only when APP_ENV is local or APP_DEBUG is true to avoid noisy logs.
        if (config('app.debug') || app()->environment('local')) {
            DB::listen(function ($query) {
                $sql = strtolower($query->sql);
                if (str_contains($sql, 'insert') && str_contains($sql, 'coupon_user')) {
                    // Log the query and bindings (careful with sensitive data)
                    Log::warning('Detected coupon_user INSERT', [
                        'sql' => $query->sql,
                        'bindings' => $query->bindings ?? [],
                        'time_ms' => $query->time ?? null,
                        'request_url' => request()->fullUrl() ?? null,
                        'request_method' => request()->method() ?? null,
                        'user_id' => optional(request()->user())->id ?? null,
                    ]);
                }
            });
        }

        // Register the activity logging middleware into the web group if present.
        // We use the router at runtime so we don't need to edit Kernel.php directly.
        if (class_exists(\App\Http\Middleware\LogActivity::class)) {
            $router = $this->app->make(\Illuminate\Routing\Router::class);
            $router->pushMiddlewareToGroup('web', \App\Http\Middleware\LogActivity::class);
        }

        // Installer middleware removed — no installer redirect registered.

        // Listen for successful login events and create an activity log entry.
        // This captures authenticated logins (no passwords or sensitive inputs stored).
        Event::listen(Login::class, function (Login $event) {
            try {
                $user = $event->user;

                $payload = [
                    'user_id' => $user ? $user->id : null,
                    'action' => 'login',
                    'url' => request()->fullUrl() ?? 'login',
                    'method' => request()->method() ?? 'POST',
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->header('User-Agent'),
                    'meta' => [
                        'guard' => $event->guard ?? null,
                    ],
                ];

                if (config('activity-logs.queue_write', true)) {
                    dispatch(new WriteActivityLog($payload));
                } else {
                    \App\Models\ActivityLog::create($payload);
                }
            } catch (\Exception $e) {
                Log::warning('ActivityLog login listener failed: '.$e->getMessage());
            }
        });

        // Register Order Observer
        \App\Models\Order::observe(\App\Observers\OrderObserver::class);
        // Register Product Observer
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
    }
}
