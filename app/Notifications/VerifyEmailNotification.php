<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

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
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('ยืนยันอีเมลของคุณ - ' . config('app.name'))
            ->greeting('สวัสดี ' . $notifiable->name . '!')
            ->line('กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ')
            ->action('ยืนยันอีเมล', $verificationUrl)
            ->line('หากคุณไม่ได้สร้างบัญชีนี้ ไม่จำเป็นต้องดำเนินการใดๆ')
            ->line('ลิงก์นี้จะหมดอายุใน 60 นาที')
            ->salutation('ขอขอบคุณ');
    }

    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}

