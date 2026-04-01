<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Ticket; // Added for relationship
use App\Models\User; // Added for relationship

class TicketReply extends Model
{
    protected $fillable = [
        'ticket_id',
        'user_id',
        'message',
        'is_internal',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
