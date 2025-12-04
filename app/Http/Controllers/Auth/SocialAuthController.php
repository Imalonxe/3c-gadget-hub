<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialLogin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class SocialAuthController extends Controller
{
    /**
     * Simulate redirect to social provider.
     * For now we immediately redirect to the callback with a mock flag.
     */
    public function redirect(Request $request, $provider)
    {
        // Redirect to the provider's OAuth authorization page.
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Simulated callback from provider. Creates/finds a user and logs them in.
     */
    public function callback(Request $request, $provider)
    {
        // Use Socialite to obtain user information from provider
        $provider = strtolower($provider);
        try {
            // Use stateless() if your app doesn't maintain session state during OAuth
            $providerUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            // On error, redirect back to login with message
            return redirect()->route('login')->withErrors(['social' => 'Unable to login using ' . $provider . '.']);
        }

        // Provider user object contains id, name, email, avatar, etc.
        $email = $providerUser->getEmail();
        $name = $providerUser->getName() ?? $providerUser->getNickname() ?? $email;
        $providerUserId = $providerUser->getId();

        // Try find existing user by provider_user_id first
        $social = SocialLogin::where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();

        if ($social) {
            $user = $social->user;
        } else {
            // Fallback: find by email
            $user = $email ? User::where('email', $email)->first() : null;
        }

        if (! $user) {
            // Don't create user immediately. Store provider info in session and
            // redirect to a consent page where the user must accept Terms/Privacy.
            session(['social_user' => [
                'provider' => $provider,
                'provider_user_id' => $providerUserId,
                'email' => $email,
                'name' => $name,
                'avatar' => $providerUser->getAvatar(),
            ]]);

            return redirect()->route('social.consent', ['provider' => $provider]);
        }

        // Ensure social login record exists and is linked
        SocialLogin::firstOrCreate([
            'user_id' => $user->id,
            'provider' => $provider,
            'provider_user_id' => $providerUserId,
        ]);

    // Log the user in
    Auth::login($user, true);

    // Redirect to intended page with a success flash so frontend shows toast
    return redirect()->intended('/')->with('success', 'Logged in successfully');
    }

    /**
     * Show consent form stored from social callback when user is new.
     */
    public function consent(Request $request, $provider)
    {
        $social = session('social_user');
        if (! $social || ($social['provider'] ?? '') !== strtolower($provider)) {
            return redirect()->route('login')->withErrors(['social' => 'No social login pending.']);
        }

        return Inertia::render('Auth/SocialConsent', [
            'provider' => $social['provider'],
        ]);
    }

    /**
     * Finalize social login after user consents.
     */
    public function consentConfirm(Request $request, $provider)
    {
        $request->validate([
            'agreed' => 'accepted',
        ]);

        $social = session('social_user');
        if (! $social || ($social['provider'] ?? '') !== strtolower($provider)) {
            return redirect()->route('login')->withErrors(['social' => 'No social login pending.']);
        }

        // Create the user now that consent is given
        $user = User::create([
            'name' => $social['name'] ?? 'User',
            'email' => $social['email'] ?? null,
            'password' => bcrypt(Str::random(16)),
        ]);

        // Send verification code
        $user->sendEmailVerificationNotification();

        // Link social login
        SocialLogin::firstOrCreate([
            'user_id' => $user->id,
            'provider' => $social['provider'],
            'provider_user_id' => $social['provider_user_id'],
        ]);

        // Clear session
        session()->forget('social_user');

        // Log in and redirect to email verification page
        Auth::login($user, true);
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();

        return Inertia::location(route('verification.notice'));
    }
}
