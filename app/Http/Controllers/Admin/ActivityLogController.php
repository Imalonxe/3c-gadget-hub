<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function __construct()
    {
        // Use existing admin middleware for index/show. The routes already apply admin middleware
        // as well, but having it here ensures controller methods are protected if used elsewhere.
        $this->middleware('admin')->only(['index', 'show']);
    }
    public function index(Request $request)
    {
    // Authorization is enforced by `admin` middleware registered on the admin routes.

        $query = ActivityLog::with('user')->orderBy('created_at', 'desc');

        // Optional action filter (e.g., ?action=login)
        $actionFilter = $request->get('action');
        if ($actionFilter) {
            $query->where('action', $actionFilter);
        }

        // Generic search (action, url, ip) and also search user name/email
        if ($search = $request->get('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });

            // also allow searching by user name or email
            $query->orWhereHas('user', function ($uq) use ($search) {
                $uq->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Explicit user filter (search by user name or id or email)
        if ($userFilter = $request->get('user')) {
            $query->whereHas('user', function ($uq) use ($userFilter) {
                $uq->where('name', 'like', "%{$userFilter}%")
                   ->orWhere('email', 'like', "%{$userFilter}%")
                   ->orWhere('id', $userFilter);
            });
        }

        // Date range filtering: from_date and to_date (YYYY-MM-DD)
        $from = $request->get('from_date');
        $to = $request->get('to_date');
        if ($from && $to) {
            // ensure inclusive of the to-date
            $query->whereDate('created_at', '>=', $from)
                  ->whereDate('created_at', '<=', $to);
        } elseif ($from) {
            $query->whereDate('created_at', '>=', $from);
        } elseif ($to) {
            $query->whereDate('created_at', '<=', $to);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'action' => $actionFilter,
                'q' => $request->get('q'),
                'user' => $request->get('user'),
                'from_date' => $request->get('from_date'),
                'to_date' => $request->get('to_date'),
            ],
        ]);
    }

    public function show($id)
    {
    // Authorization enforced by middleware
        $log = ActivityLog::with('user')->findOrFail($id);

        return Inertia::render('Admin/ActivityLogs/Show', [
            'log' => $log,
        ]);
    }

    public function storeEvent(Request $request)
    {
        // Endpoint for client-side events (F12, copy/paste, clicks, etc.)
        $user = $request->user();

        $data = $request->validate([
            'action' => 'required|string|max:191',
            'meta' => 'nullable|array',
        ]);

        // Prefer the originating page URL if the client included it in meta.url
        $meta = $data['meta'] ?? [];
        $originUrl = data_get($meta, 'url') ?: $request->get('url') ?: $request->header('Referer') ?: $request->fullUrl();

        ActivityLog::create([
            'user_id' => $user ? $user->id : null,
            'action' => $data['action'],
            'url' => $originUrl,
            'method' => $request->method(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'meta' => $meta ?: null,
        ]);

        return response()->json(['ok' => true]);
    }

    protected function authorizeView()
    {
        $user = auth()->user();
        if (! $user) {
            abort(403);
        }

        // Default: allow if user has is_admin true. Adjust this to fit your app's RBAC.
        if (! ($user->is_admin ?? false)) {
            abort(403);
        }
    }
}
