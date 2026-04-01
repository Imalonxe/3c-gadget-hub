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
    const [focusedField, setFocusedField] = useState(null);

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

            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .form-container {
                    animation: slideInUp 0.6s ease-out;
                }
                .form-field {
                    animation: slideInUp 0.6s ease-out backwards;
                }
                .form-field:nth-child(1) { animation-delay: 0.1s; }
                .form-field:nth-child(2) { animation-delay: 0.2s; }
                .form-field:nth-child(3) { animation-delay: 0.3s; }
                .form-field:nth-child(4) { animation-delay: 0.4s; }
                .form-field:nth-child(5) { animation-delay: 0.5s; }
                .form-field:nth-child(6) { animation-delay: 0.6s; }
                .social-section {
                    animation: fadeIn 0.8s ease-out 0.7s backwards;
                }
                .form-input {
                    transition: all 0.3s ease;
                    border: 2px solid #e5e7eb;
                }
                .form-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                    transform: translateY(-2px);
                }
                .btn-login {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .btn-login:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
                }
                .btn-login:active:not(:disabled) {
                    transform: translateY(0);
                }
            `}</style>

            <div className="form-container">
                {status && (
                    <div className="mb-4 p-4 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="form-field">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="form-input mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="form-field">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="form-input mt-1 block w-full"
                            autoComplete="current-password"
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="form-field block">
                        <label className="flex items-center group cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                Remember me
                            </span>
                        </label>
                    </div>

                    {/* v2 checkbox widget (Google will replace this div with the widget) */}
                    {recaptchaSiteKey && (
                        <div className="form-field">
                            <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
                            {recaptchaError && (
                                <div className="mt-2 text-sm text-red-600">{recaptchaError}</div>
                            )}
                            {errors.recaptcha && (
                                <div className="mt-2 text-sm text-red-600">{errors.recaptcha}</div>
                            )}
                        </div>
                    )}

                    <div className="form-field flex items-center justify-between gap-4 pt-4">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        )}

                        <PrimaryButton type="submit" className="btn-login ms-auto" disabled={processing}>
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Log in'
                            )}
                        </PrimaryButton>
                    </div>
                </form>

                <div className="social-section mt-8">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <a
                            href={route('social.redirect', { provider: 'google' })}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"><path fill="#EA4335" d="M24 9.5c3.9 0 7 1.5 9.1 2.8l6.7-6.7C35.6 2.7 30.1 0.5 24 0.5 14.7 0.5 6.8 6.8 3 14.9l7.8 6.1C12.8 15.1 17.9 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.6-2 4.8-4.3 6.3l6.8 5.3C43.7 36.9 46.5 30.9 46.5 24.5z" /><path fill="#FBBC05" d="M10.8 28.9A14.9 14.9 0 0 1 9.5 24.5c0-1.6.3-3.1.9-4.4L2.6 13.9A23.9 23.9 0 0 0 0.5 24.5c0 3.8.9 7.3 2.6 10.6l7.7-6.2z" /><path fill="#34A853" d="M24 46c6.1 0 11.6-2 15.8-5.5l-7.8-6.1c-2.2 1.5-5 2.4-8 2.4-6.1 0-11.2-5.6-12.3-12.9l-7.8 6.1C6.8 41.2 14.7 46 24 46z" /></svg>
                            <span className="text-sm font-medium dark:text-gray-200">Google</span>
                        </a>

                        <a
                            href={route('social.redirect', { provider: 'facebook' })}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path fill="#1877F2" d="M22 12a10 10 0 1 0-11.5 9.9v-7H8.9v-3h1.6V9.3c0-1.6.9-2.6 2.3-2.6.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1.1.5-1.1 1v1.2h1.9l-.3 3H13v7A10 10 0 0 0 22 12z" /></svg>
                            <span className="text-sm font-medium dark:text-gray-200">Facebook</span>
                        </a>
                    </div>
                </div>

                <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account? <Link href={route('register')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline">Sign up</Link>
                </div>
            </div>
        </GuestLayout>
    );
}
