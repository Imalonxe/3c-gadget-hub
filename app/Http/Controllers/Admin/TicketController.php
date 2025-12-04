<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

use App\Traits\LogsActivity;

class TicketController extends Controller
{
    use LogsActivity;

    public function index(Request $request)
    {
        $tickets = Ticket::with('user')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->priority, function ($query, $priority) {
                return $query->where('priority', $priority);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('id', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['status', 'priority', 'search']),
        ]);
    }

    public function show(Ticket $ticket)
    {
        $ticket->load(['user', 'attachments', 'replies.user', 'order']);

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
            'priority' => 'required|in:low,medium,high',
        ]);

        $ticket->update($request->only(['status', 'priority']));

        $this->logActivity('update_ticket', [
            'ticket_id' => $ticket->id,
            'status' => $ticket->status,
            'priority' => $ticket->priority,
            'changes' => $ticket->getChanges()
        ]);

        return redirect()->back()->with('success', 'Ticket updated successfully.');
    }

    public function reply(Request $request, Ticket $ticket)
    {
        $request->validate([
            'message' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        $reply = $ticket->replies()->create([
            'user_id' => Auth::id(),
            'message' => $request->message,
            'is_internal' => $request->boolean('is_internal'),
        ]);

        // If replying to user, maybe update status to in_progress or resolved?
        // For now, let admin manually update status.

        $this->logActivity('reply_ticket', [
            'ticket_id' => $ticket->id,
            'reply_id' => $reply->id,
            'is_internal' => $request->boolean('is_internal')
        ]);

        return redirect()->back()->with('success', 'Reply added successfully.');
    }
}
