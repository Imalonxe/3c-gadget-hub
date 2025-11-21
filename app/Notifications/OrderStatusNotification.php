<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class OrderStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $oldStatus;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order, string $oldStatus)
    {
        $this->order = $order;
        $this->oldStatus = $oldStatus;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $message = match($this->order->status) {
            Order::STATUS_PROCESSING => 'Your order is now being processed.',
            Order::STATUS_SHIPPED => 'Your order has been shipped.',
            Order::STATUS_DELIVERED => 'Your order has been delivered.',
            Order::STATUS_CANCELLED => 'Your order has been cancelled.',
            default => 'Your order status has been updated.'
        };

        return (new MailMessage)
            ->subject("Order Status Update - {$this->order->order_number}")
            ->greeting("Hello {$notifiable->name}!")
            ->line($message)
            ->line("Order Number: {$this->order->order_number}")
            ->action('View Order Details', route('user.orders.show', $this->order))
            ->line('Thank you for shopping with us!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'old_status' => $this->oldStatus,
            'new_status' => $this->order->status,
            'message' => "Order {$this->order->order_number} status changed from {$this->oldStatus} to {$this->order->status}"
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}