<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

use App\Traits\LogsActivity;

class VerifyEmailController extends Controller
{
    use LogsActivity;

    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(route('home').'?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));

            $this->logActivity('verify_email', [
                'user_id' => $request->user()->id,
                'email' => $request->user()->email,
                'method' => 'link'
            ]);
        }

        return redirect()->intended(route('home').'?verified=1');
    }
}
