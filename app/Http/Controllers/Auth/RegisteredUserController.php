<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;

use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Services\Recaptcha;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    use LogsActivity;
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'recaptchaSiteKey' => config('services.recaptcha.site'),
            'recaptchaAction' => 'register',
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => [
                'required', 
                'confirmed', 
                Rules\Password::min(8)
            ],
            // Removed recaptcha requirement from here - will validate in controller
            // 'g-recaptcha-response' => ['required', 'string'],
        ]);

        // verify recaptcha v2 (checkbox)
        if (!app()->environment('testing')) {
            $token = $request->input('g-recaptcha-response');
            $body = Recaptcha::verify($token, $request->ip());
            if (! $token || ! $body || empty($body['success'])) {
                throw ValidationException::withMessages(['recaptcha' => 'reCAPTCHA verification failed']);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Send verification code
        $user->sendEmailVerificationNotification();

        Auth::login($user);
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        // Log successful registration
        $this->logActivity('register', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        // Redirect to email verification page
        return redirect(route('verification.notice'));
    }
}
