import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

import { useEffect, useState, useRef } from 'react';

export default function Login({ status, canResetPassword, recaptchaSiteKey, recaptchaAction }) {
    // TEMP: bundle marker to verify browser loaded the latest Login bundle
    if (typeof window !== 'undefined') console.log('LOGIN_BUNDLE_LOADED', { url: window.location.href });
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        'g-recaptcha-response': '',
    });
    const [recaptchaError, setRecaptchaError] = useState('');
    const shouldSubmitRef = useRef(false);

    useEffect(() => {
        if (!recaptchaSiteKey) return;

        // load v2 checkbox script (no explicit render param)
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js`;
        script.async = true;
        script.defer = true;
        script.onload = () => console.debug('reCAPTCHA v2 script loaded');
        document.body.appendChild(script);

        return () => {
            // no cleanup needed for script
        };
    }, [recaptchaSiteKey]);

    const submit = async (e) => {
        e.preventDefault();
        console.log('Login: submit handler entered', { processing, url: window.location.href });
        if (typeof window !== 'undefined') {
            console.log('Login: grecaptcha present?', !!window.grecaptcha, { grecaptcha: typeof window.grecaptcha });
        }

        // For v2 checkbox the widget will populate a textarea/input named 'g-recaptcha-response'
        let token = null;
        if (recaptchaSiteKey) {
                try {
                    // try to read the token from the DOM
                    const el = document.querySelector('[name="g-recaptcha-response"]');
                    if (el && el.value) token = el.value;
                    // fallback to grecaptcha.getResponse()
                    if (!token && window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
                        try {
                            const resp = window.grecaptcha.getResponse();
                            if (resp) token = resp;
                        } catch (e) {
                            // ignore
                        }
                    }
                    if (!token) {
                        setRecaptchaError('Please complete the reCAPTCHA checkbox');
                        console.log('Login: no reCAPTCHA token found in DOM or grecaptcha.getResponse()');
                        return;
                    }
                    console.log('Login: reCAPTCHA token read', { len: token.length });
                } catch (err) {
                    console.error('reCAPTCHA read error', err);
                    setRecaptchaError('reCAPTCHA failed to read response');
                    return;
                }
        }

        // Update the form data with the token, then submit
        console.log('Login: setting g-recaptcha-response field in form data');
        setData('g-recaptcha-response', token || '');
        shouldSubmitRef.current = true;
    };

    // Submit when the recaptcha field has been set
    useEffect(() => {
        if (shouldSubmitRef.current && data['g-recaptcha-response']) {
            shouldSubmitRef.current = false;
            console.log('Login: form data updated with token, submitting now');
            post(route('login'), {
                onStart: () => {
                    console.log('Login: POST request started');
                },
                onSuccess: (page) => {
                    console.log('Login: success, redirecting to home');
                    window.location.href = route('home');
                },
                onError: (errs) => {
                    console.log('Login: validation errors', errs);
                },
                onFinish: () => {
                    reset('password');
                },
            });
        }
    }, [data, post, reset]);

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton type="submit" className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>

                    {/* v2 checkbox widget (Google will replace this div with the widget) */}
                    {recaptchaSiteKey && (
                        <div className="mt-4">
                            <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
                            {recaptchaError && (
                                <div className="mt-2 text-sm text-red-600">{recaptchaError}</div>
                            )}
                            {errors.recaptcha && (
                                <div className="mt-2 text-sm text-red-600">{errors.recaptcha}</div>
                            )}
                        </div>
                    )}

            <div className="mt-6">
                <div className="text-center text-sm text-gray-500 mb-3">Or continue with</div>
                <div className="flex gap-3 justify-center">
                    <a
                        href={route('social.redirect', { provider: 'google' })}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.9 0 7 1.5 9.1 2.8l6.7-6.7C35.6 2.7 30.1 0.5 24 0.5 14.7 0.5 6.8 6.8 3 14.9l7.8 6.1C12.8 15.1 17.9 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.6-2 4.8-4.3 6.3l6.8 5.3C43.7 36.9 46.5 30.9 46.5 24.5z"/><path fill="#FBBC05" d="M10.8 28.9A14.9 14.9 0 0 1 9.5 24.5c0-1.6.3-3.1.9-4.4L2.6 13.9A23.9 23.9 0 0 0 0.5 24.5c0 3.8.9 7.3 2.6 10.6l7.7-6.2z"/><path fill="#34A853" d="M24 46c6.1 0 11.6-2 15.8-5.5l-7.8-6.1c-2.2 1.5-5 2.4-8 2.4-6.1 0-11.2-5.6-12.3-12.9l-7.8 6.1C6.8 41.2 14.7 46 24 46z"/></svg>
                        <span className="text-sm">Google</span>
                    </a>

                    <a
                        href={route('social.redirect', { provider: 'facebook' })}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded border hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="#1877F2" d="M22 12a10 10 0 1 0-11.5 9.9v-7H8.9v-3h1.6V9.3c0-1.6.9-2.6 2.3-2.6.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1.1.5-1.1 1v1.2h1.9l-.3 3H13v7A10 10 0 0 0 22 12z"/></svg>
                        <span className="text-sm">Facebook</span>
                    </a>
                </div>
            </div>
        </GuestLayout>
    );
}
