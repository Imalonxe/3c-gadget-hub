<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use App\Services\Recaptcha;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    use LogsActivity;
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'recaptchaSiteKey' => config('services.recaptcha.site'),
            // v3 action name for client to execute
            'recaptchaAction' => 'login',
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // TEMP DEBUG: log incoming payload to inspect whether g-recaptcha-response arrives
        Log::info('login payload debug', $request->all());

        // ensure recaptcha token exists and is valid (v2 checkbox)
        if (!app()->environment('testing')) {
            $token = $request->input('g-recaptcha-response');
            Log::info('recaptcha token received', ['token_len' => strlen($token ?? ''), 'token_first_50' => substr($token ?? '', 0, 50)]);
            $body = Recaptcha::verify($token, $request->ip());
            Log::info('recaptcha verify response', ['body' => $body]);
            if (! $token || ! $body || empty($body['success'])) {
                Log::info('recaptcha v2 failed for login attempt', ['ip' => $request->ip(), 'body' => $body, 'token_present' => !empty($token)]);
                throw ValidationException::withMessages(['recaptcha' => 'reCAPTCHA verification failed']);
            }
            Log::info('recaptcha v2 passed for login attempt', ['ip' => $request->ip(), 'email' => $request->input('email')]);
        }

        try {
            $request->authenticate();
            Log::info('authentication succeeded', ['email' => $request->input('email'), 'ip' => $request->ip()]);
        } catch (\Throwable $e) {
            Log::warning('authentication failed', ['email' => $request->input('email'), 'ip' => $request->ip(), 'error' => $e->getMessage()]);
            throw $e;
        }

        if (Auth::user()->isBanned()) {
            return redirect()->route('banned');
        }

        $request->session()->regenerate();

        // Log login activity
        $this->logActivity('login', [
            'email' => $request->input('email'),
            'ip' => $request->ip()
        ]);

        // Redirect to home page after login
        // Flash a success message so the frontend's toast shows login success
        return redirect()->intended(route('home'))->with('success', 'Logged in successfully');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Log logout before destroying session
        $this->logActivity('logout');

        Auth::guard('web')->logout();

    $request->session()->invalidate();

    $request->session()->regenerateToken();

    // Use redirect with flash so message survives the session regenerate
    return redirect('/')->with('success', 'Logged out successfully');
    }
}
