<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendVerificationCodeNotification extends Notification
{
    use Queueable;

    protected $code;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $code)
    {
        $this->code = $code;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('รหัสยืนยันอีเมลของคุณ - ' . config('app.name'))
            ->greeting('สวัสดี ' . $notifiable->name . '!')
            ->line('กรุณาใช้รหัสยืนยันด้านล่างเพื่อยืนยันอีเมลของคุณ:')
            ->line('**' . $this->code . '**')
            ->line('รหัสนี้จะหมดอายุใน 10 นาที')
            ->line('หากคุณไม่ได้สร้างบัญชีนี้ ไม่จำเป็นต้องดำเนินการใดๆ')
            ->salutation('ขอขอบคุณ');
    }
}
