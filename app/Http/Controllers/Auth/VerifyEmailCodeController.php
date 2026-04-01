<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\EmailVerificationCode;

use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

use App\Traits\LogsActivity;

class VerifyEmailCodeController extends Controller
{
    use LogsActivity;

    /**
     * Verify the email verification code.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Email already verified'], 200);
            }
            return redirect()->intended(route('home'));
        }

        // Find valid verification code
        $verificationCode = EmailVerificationCode::where('user_id', $user->id)
            ->where('code', $request->code)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$verificationCode) {
            $errorMessage = 'รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง';
            if ($request->wantsJson()) {
                return response()->json(['code' => $errorMessage], 422);
            }
            return back()->withErrors([
                'code' => $errorMessage,
            ]);
        }

        // Mark code as used
        $verificationCode->markAsUsed();

        // Verify user's email
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));

            $this->logActivity('verify_email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'method' => 'code'
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Email verified successfully'], 200);
        }
        return redirect()->route('home');
    }

    /**
     * Resend verification code.
     */
    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            $message = 'Email already verified';
            if ($request->wantsJson()) {
                return response()->json(['message' => $message], 200);
            }
            return redirect()->intended(route('home'));
        }

        // Send verification code
        $user->sendEmailVerificationNotification();

        $successMessage = 'Verification code sent successfully';
        if ($request->wantsJson()) {
            return response()->json(['message' => $successMessage], 200);
        }
        return back()->with('status', 'verification-code-sent');
    }
}
