<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetCorsHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Allow requests from Cloudflare and local dev
        $allowedOrigins = [
            'http://127.0.0.1:8000',
            'http://localhost:8000',
            'http://127.0.0.1:5173',
            'http://localhost:5173',
            // Add your Cloudflare URL here:
            // 'https://your-domain.trycloudflare.com',
        ];

        $origin = $request->header('Origin');
        
        // Allow any localhost/127.0.0.1 origin for dev
        if ($origin && (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false)) {
            $response->header('Access-Control-Allow-Origin', $origin);
        } elseif (in_array($origin, $allowedOrigins)) {
            $response->header('Access-Control-Allow-Origin', $origin);
        }

        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
        $response->header('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}
