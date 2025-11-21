<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'verified.email' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle 419 CSRF token mismatch for Inertia requests
        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, \Illuminate\Http\Request $request) {
            if ($request->header('X-Inertia')) {
                // For Inertia requests, return a proper response that Inertia can handle
                return back()->withErrors([
                    'csrf' => 'Session expired. Please refresh the page and try again.'
                ]);
            }
        });

        // Handle 429 Too Many Requests for Inertia requests
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->header('X-Inertia')) {
                $headers = $e->getHeaders();
                $retryAfter = $headers['Retry-After'] ?? $headers['X-RateLimit-Reset-After'] ?? 60;
                $minutes = ceil($retryAfter / 60);
                
                return back()->withErrors([
                    'rate_limit' => "คุณสามารถโพสคำถามได้เพียง 1 ครั้งต่อชั่วโมง กรุณารออีก {$minutes} นาที"
                ]);
            }
        });
    })->create();
