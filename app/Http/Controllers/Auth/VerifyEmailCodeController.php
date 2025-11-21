<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailVerificationCode;
use App\Notifications\SendVerificationCodeNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VerifyEmailCodeController extends Controller
{
    /**
     * Verify the email verification code.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('home'));
        }

        // Find valid verification code
        $verificationCode = EmailVerificationCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$verificationCode) {
            return back()->withErrors([
                'code' => 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง',
            ]);
        }

        // Mark code as used
        $verificationCode->markAsUsed();

        // Verify user's email
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->route('home');
    }

    /**
     * Resend verification code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('home'));
        }

        // Create new verification code and send email
        $verificationCode = EmailVerificationCode::createForUser($user);
        $user->notify(new SendVerificationCodeNotification($verificationCode->code));

        return back()->with('status', 'verification-code-sent');
    }
}
