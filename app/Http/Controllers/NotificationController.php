<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogsActivity;
use Inertia\Inertia;

class NotificationController extends Controller
{
    use LogsActivity;
    /**
     * Return a page with the user's notifications.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()->latest()->paginate(20);

        return Inertia::render('User/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $user->unreadNotifications->markAsRead();

        // Log mark all notifications as read
        $this->logActivity('mark_all_notifications_read', [
            'count' => $user->unreadNotifications->count(),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'All notifications marked as read.']);
        }

        return back()->with('success', 'All notifications marked as read.');
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();

            // Log notification mark as read
            $this->logActivity('mark_notification_read', [
                'notification_id' => $id,
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Notification marked as read.']);
        }

        return back();
    }
}
