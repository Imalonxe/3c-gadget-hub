<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Middleware retained as a no-op after installer removal.
 *
 * Previously this redirected unauthorised requests to the installer UI.
 * Since the installer has been removed, this middleware simply passes the
 * request through unchanged so existing middleware registration remains safe.
 */
class EnsureInstalled
{
    public function handle(Request $request, Closure $next)
    {
        return $next($request);
    }
}
