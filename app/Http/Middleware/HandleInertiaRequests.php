<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Guard against calling $request->user() when the database isn't configured
        // yet (for example during fresh install when DB is missing). Attempting
        // to resolve the user can trigger a DB query which throws a
        // QueryException and prevents the installer UI from loading.
        $user = null;
        $userData = null;

        try {
            // Only attempt to load the authenticated user if the users table
            // appears to exist. Schema::hasTable may itself throw if DB is
            // misconfigured; that's why we wrap here in a try/catch.
            if (class_exists(\Illuminate\Support\Facades\Schema::class) && \Illuminate\Support\Facades\Schema::hasTable('users')) {
                $user = $request->user();
            }
        } catch (\Throwable $e) {
            // DB not ready: log and continue with null user so installer can run.
            \Log::warning('Could not resolve authenticated user during Inertia share: ' . $e->getMessage());
            $user = null;
        }

        if ($user) {
            // Load recent notifications and unread count to share with Inertia pages.
            // Guard against missing notifications table (e.g., before migrations) or DB errors.
            $recentNotifications = collect([]);
            $unreadCount = 0;

            try {
                if (class_exists(\Illuminate\Support\Facades\Schema::class) && \Illuminate\Support\Facades\Schema::hasTable('notifications')) {
                    $recentNotifications = $user->notifications()->latest()->take(10)->get()->map(function ($n) {
                        return [
                            'id' => $n->id,
                            'data' => $n->data,
                            'read_at' => $n->read_at,
                            'created_at' => $n->created_at,
                        ];
                    });

                    $unreadCount = $user->unreadNotifications()->count();
                }
            } catch (\Exception $e) {
                // If the DB isn't ready or there's an error, log and fall back to empty notifications.
                \Log::warning('Could not load notifications for Inertia share: ' . $e->getMessage());
                $recentNotifications = collect([]);
                $unreadCount = 0;
            }

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'is_admin' => $user->is_admin ?? false,
                'banned_until' => $user->banned_until,
                'ban_reason' => $user->ban_reason,
                'xp' => $user->xp,
                'level' => $user->level,
                'notifications' => $recentNotifications,
                'unread_notifications_count' => $unreadCount,
            ];
        }
        
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'ziggy' => fn () => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'csrf_token' => csrf_token(),
        ];
    }
}
