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

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
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

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>

            {showAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-40" onClick={() => setShowAgreement(false)} />

                    <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4 p-6 z-10">
                        <h3 className="text-lg font-semibold mb-4">ข้อกำหนดและเงื่อนไข / นโยบายความเป็นส่วนตัว</h3>

                        <div className="max-h-72 overflow-auto mb-4 prose">
                            <h4>Terms and Conditions</h4>
                            <p>โปรดอ่านข้อกำหนดและเงื่อนไขของเราก่อนสมัครสมาชิก โดยการติ๊กยืนยันคุณยอมรับข้อตกลงทั้งหมดของเรา</p>

                            <h4>Privacy Policy</h4>
                            <p>โปรดอ่านนโยบายความเป็นส่วนตัวเพื่อดูวิธีที่เราจัดการข้อมูลส่วนบุคคลของคุณ</p>

                            <p className="text-sm text-gray-500">คุณสามารถอ่านเวอร์ชันฉบับเต็มได้ที่ลิงก์ด้านล่าง</p>
                            <ul className="list-disc pl-5">
                                <li><Link href={route('terms')} className="text-blue-600 underline">Terms & Conditions (ดูรายละเอียด)</Link></li>
                                <li><Link href={route('privacy')} className="text-blue-600 underline">Privacy Policy (ดูรายละเอียด)</Link></li>
                            </ul>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                            <input id="agree" name="agreed" type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setData('agreed', e.target.checked ? '1' : ''); }} className="mt-1" />
                            <label htmlFor="agree" className="text-sm">ฉันได้อ่านและยินยอมต่อ <Link href={route('terms')} className="text-blue-600 underline">Terms & Conditions</Link> และ <Link href={route('privacy')} className="text-blue-600 underline">Privacy Policy</Link></label>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => { setShowAgreement(false); setAgreed(false); }} className="px-4 py-2 border rounded-md">ยกเลิก</button>
                            <button type="button" onClick={confirmAndRegister} disabled={!agreed || processing} className={`px-4 py-2 rounded-md text-white ${(!agreed || processing) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {processing ? 'กำลังสร้าง...' : 'ยืนยันและสมัคร'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {recaptchaSiteKey && (
                <div className="mt-4">
                    <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
                    {recaptchaError && <div className="mt-2 text-sm text-red-600">{recaptchaError}</div>}
                    {errors.recaptcha && <div className="mt-2 text-sm text-red-600">{errors.recaptcha}</div>}
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
