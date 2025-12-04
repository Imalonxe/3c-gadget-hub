<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Order;
use App\Models\TicketAttachment;
use App\Models\TicketReply;

class Ticket extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'topic',
        'subject',
        'message',
        'order_id',
        'status',
        'priority',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }

    public function attachments()
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function replies()
    {
        return $this->hasMany(TicketReply::class);
    }
}
