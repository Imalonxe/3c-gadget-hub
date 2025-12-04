import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function Register({ recaptchaSiteKey, recaptchaAction }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        'g-recaptcha-response': '',
    });
    const [recaptchaError, setRecaptchaError] = useState('');

    const [showAgreement, setShowAgreement] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const shouldRegisterRef = useRef(false);

    const submit = (e) => {
        e.preventDefault();

        // Open agreement modal — user must read & agree before we actually register
        setShowAgreement(true);
    };

    const confirmAndRegister = () => {
        if (!agreed) return;

        // Ensure CSRF token is included in the payload (workaround for occasional 419 Page Expired)
        try {
            const token = document.querySelector('meta[name="csrf-token"]').content;
            if (token) setData('_token', token);
        } catch (e) {
            // ignore if not available
        }

        // Send agreed as '1' to satisfy Laravel "accepted" rule
        setData('agreed', '1');

        setRecaptchaError('');

        const doRegister = async () => {
            if (recaptchaSiteKey) {
                // read token from DOM (v2 checkbox) or grecaptcha.getResponse
                try {
                    let token = null;
                    const el = document.querySelector('[name="g-recaptcha-response"]');
                    if (el && el.value) token = el.value;
                    if (!token && window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
                        const resp = window.grecaptcha.getResponse();
                        if (resp) token = resp;
                    }
                    if (!token) {
                        setRecaptchaError('Please complete the reCAPTCHA checkbox');
                        return;
                    }
                    console.log('Register: reCAPTCHA token read', { len: token.length });
                    // Update form data with token
                    setData('g-recaptcha-response', token);
                    shouldRegisterRef.current = true;
                } catch (err) {
                    console.error('reCAPTCHA read error', err);
                    setRecaptchaError('reCAPTCHA failed to read response');
                    return;
                }
            } else {
                // No recaptcha, register directly
                postRegister();
            }
        };

        void doRegister();
    };

    const postRegister = () => {
        post(route('register'), {
            onSuccess: () => {
                console.log('Register: success, redirecting to verification notice');
                window.location.href = route('verification.notice');
            },
            onError: (errs) => {
                console.log('Register: validation errors', errs);
            },
            onFinish: () => {
                reset('password', 'password_confirmation');
                setShowAgreement(false);
                setAgreed(false);
            },
        });
    };

    useEffect(() => {
        if (!recaptchaSiteKey) return;

        // load v2 checkbox script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js`;
        script.async = true;
        script.defer = true;
        script.onload = () => console.debug('reCAPTCHA v2 script loaded (register)');
        document.body.appendChild(script);
    }, [recaptchaSiteKey]);

    // Submit when recaptcha token has been set in form data
    useEffect(() => {
        if (shouldRegisterRef.current && data['g-recaptcha-response']) {
            shouldRegisterRef.current = false;
            console.log('Register: form data updated with token, posting now');
            postRegister();
        }
    }, [data]);

    return (
        <GuestLayout>
            <Head title="Register" />

            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
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
                .btn-register {
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .btn-register:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
                }
                .btn-register:active:not(:disabled) {
                    transform: translateY(0);
                }
                .modal-backdrop {
                    animation: fadeIn 0.3s ease-out;
                }
                .modal-content {
                    animation: slideInUp 0.4s ease-out;
                }
                .modal-backdrop.loading::before {
                    content: '';
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    width: 40px;
                    height: 40px;
                    margin: -20px 0 0 -20px;
                    border: 3px solid rgba(79, 70, 229, 0.1);
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="form-container">
                <form onSubmit={submit} className="space-y-5">
                    <div className="form-field">
                        <InputLabel htmlFor="name" value="Full Name" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="form-input mt-1 block w-full"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="form-field">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="form-input mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
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
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="form-field">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Confirm Password"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="form-input mt-1 block w-full"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    {recaptchaSiteKey && (
                        <div className="form-field">
                            <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
                            {recaptchaError && <div className="mt-2 text-sm text-red-600">{recaptchaError}</div>}
                            {errors.recaptcha && <div className="mt-2 text-sm text-red-600">{errors.recaptcha}</div>}
                        </div>
                    )}

                    <div className="form-field flex items-center justify-between gap-4 pt-4">
                        <Link
                            href={route('login')}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline transition-colors"
                        >
                            Already registered?
                        </Link>

                        <PrimaryButton className="btn-register ms-auto" disabled={processing}>
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Register'
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
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with</span>
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
            </div>

            {showAgreement && (
                <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="modal-content relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full mx-4 p-6">
                        <button
                            type="button"
                            onClick={() => setShowAgreement(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Terms & Conditions</h3>

                        <div className="max-h-72 overflow-auto mb-6 prose prose-sm dark:prose-invert">
                            <h4 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">Terms and Conditions</h4>
                            <p className="text-gray-600 dark:text-gray-300">โปรดอ่านข้อกำหนดและเงื่อนไขของเราก่อนสมัครสมาชิก โดยการติ๊กยืนยันคุณยอมรับข้อตกลงทั้งหมดของเรา</p>

                            <h4 className="font-semibold text-lg mb-3 mt-4 text-gray-900 dark:text-white">Privacy Policy</h4>
                            <p className="text-gray-600 dark:text-gray-300">โปรดอ่านนโยบายความเป็นส่วนตัวเพื่อดูวิธีที่เราจัดการข้อมูลส่วนบุคคลของคุณ</p>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">คุณสามารถอ่านเวอร์ชันฉบับเต็มได้ที่ลิงก์ด้านล่าง</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><Link href={route('terms')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium">Terms & Conditions (ดูรายละเอียด)</Link></li>
                                <li><Link href={route('privacy')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium">Privacy Policy (ดูรายละเอียด)</Link></li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <input
                                id="agree"
                                name="agreed"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => { setAgreed(e.target.checked); setData('agreed', e.target.checked ? '1' : ''); }}
                                className="mt-1 w-4 h-4 cursor-pointer rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700"
                            />
                            <label htmlFor="agree" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                ฉันได้อ่านและยินยอมต่อ <Link href={route('terms')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium">Terms & Conditions</Link> และ <Link href={route('privacy')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium">Privacy Policy</Link>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowAgreement(false); setAgreed(false); }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={confirmAndRegister}
                                disabled={!agreed || processing}
                                className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${(!agreed || processing) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
                            >
                                {processing ? 'กำลังสร้าง...' : 'ยืนยันและสมัคร'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
