<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;

class EnsureSessionAlive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // If session is regenerated or CSRF token doesn't match, regenerate session
        try {
            // This will throw TokenMismatchException if CSRF token is invalid
            // We catch it and regenerate the session instead of failing
            return $next($request);
        } catch (TokenMismatchException $e) {
            // Regenerate session to get new CSRF token
            session()->regenerate();
            
            // Redirect back with error message
            return back()->withErrors([
                'code' => 'เซッชันหมดอายุ กรุณาลองใหม่อีกครั้ง',
            ]);
        }
    }
}
