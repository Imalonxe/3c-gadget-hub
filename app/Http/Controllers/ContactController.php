<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Traits\LogsActivity;

class ContactController extends Controller
{
    use LogsActivity;
    public function index()
    {
        $orders = [];
        if (Auth::check()) {
            $orders = Order::where('user_id', Auth::id())
                ->where('order_status', '!=', 'cancelled')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->order_id,
                        'display_text' => ($order->order_number ?? "Order #{$order->order_id}") . " - " . $order->created_at->format('d/m/Y'),
                    ];
                });
        }

        return Inertia::render('Contact/Index', [
            'orders' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'topic' => 'required|string|in:general,order,bug,payment',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'order_id' => 'nullable|exists:orders,order_id',
            'attachment' => 'nullable|file|max:10240', // 10MB max
            'metadata' => 'nullable|array',
        ]);

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'email' => $request->email,
            'topic' => $request->topic,
            'subject' => $request->subject,
            'message' => $request->message,
            'order_id' => $request->order_id,
            'status' => 'open',
            'priority' => 'medium',
            'metadata' => $request->metadata,
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('tickets', 'public');

            $ticket->attachments()->create([
                'file_path' => '/storage/' . $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
            ]);
        }

        $this->logActivity('create_ticket', [
            'ticket_id' => $ticket->id,
            'subject' => $ticket->subject,
            'topic' => $ticket->topic
        ]);

        return redirect()->back()->with('success', 'Ticket created successfully. Ticket ID: #' . $ticket->id);
    }
    public function myTickets()
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $tickets = Ticket::where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Contact/MyTickets', [
            'tickets' => $tickets,
        ]);
    }

    public function show(Ticket $ticket)
    {
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $ticket->load([
            'replies' => function ($query) {
                $query->where('is_internal', false)->with('user');
            },
            'attachments'
        ]);

        return Inertia::render('Contact/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function reply(Request $request, Ticket $ticket)
    {
        if ($ticket->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'message' => 'required|string',
        ]);

        $ticket->replies()->create([
            'user_id' => Auth::id(),
            'message' => $request->message,
        ]);

        // Optional: Update ticket status if needed, e.g., to 'open' if it was 'resolved'
        // $ticket->update(['status' => 'open']);

        $this->logActivity('reply_ticket', [
            'ticket_id' => $ticket->id,
            'reply_id' => $ticket->replies()->latest()->first()->id
        ]);

        return redirect()->back()->with('success', 'Reply sent successfully.');
    }
}
