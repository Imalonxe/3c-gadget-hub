<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyViteAssets
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // ถ้าเป็น request ไปหา @vite หรือ assets จาก Vite dev server
        if ($request->path() === '@vite' || strpos($request->path(), '@vite') === 0) {
            return $next($request);
        }

        // Proxy requests ไปยัง Vite dev server
        if (app()->environment('local') && 
            (strpos($request->path(), '/@') === 0 || 
             strpos($request->path(), '/resources/') === 0 ||
             strpos($request->path(), '/vite/') === 0)) {
            
            try {
                $response = Http::withoutVerifying()
                    ->get('http://127.0.0.1:5173' . $request->getRequestUri());
                
                return response($response->body(), $response->status(), $response->headers());
            } catch (\Exception $e) {
                // ถ้า Vite server ไม่ตอบ ให้ส่งต่อไปให้ app ปกติ
            }
        }

        return $next($request);
    }
}
