import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function VerifyEmail({ status, email }) {
    const { data, setData, post, processing, errors } = useForm({
        code: ['', '', '', '', '', ''],
    });

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleCodeChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) {
            return;
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Update form data
        setData('code', newCode.join(''));
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then((text) => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newCode = [...code];
                digits.forEach((digit, i) => {
                    if (i < 6) {
                        newCode[i] = digit;
                    }
                });
                setCode(newCode);
                setData('code', newCode.join(''));
                const nextEmptyIndex = newCode.findIndex((c) => !c);
                if (nextEmptyIndex !== -1) {
                    inputRefs.current[nextEmptyIndex]?.focus();
                } else {
                    inputRefs.current[5]?.focus();
                }
            });
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((digit, i) => {
            if (i < 6) {
                newCode[i] = digit;
            }
        });
        setCode(newCode);
        setData('code', newCode.join(''));
        const nextEmptyIndex = newCode.findIndex((c) => !c);
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleResend = (e) => {
        e.preventDefault();
        post(route('verification.resend'));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            return;
        }
        setData('code', fullCode);
        post(route('verification.verify.code'), {
            onSuccess: () => {
                toast.success('Email verified successfully!', {
                    duration: 3000,
                    position: 'top-center',
                });
                setTimeout(() => {
                    window.location.href = route('home');
                }, 500);
            },
            onError: () => {
                toast.error('Verification failed. Please try again.', {
                    duration: 3000,
                    position: 'top-center',
                });
            },
        });
    };

    return (
        <GuestLayout hideLogo={true}>
            <Head title="ยืนยันอีเมล" />

            <div className="w-full">
                {/* Icon Section */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="relative bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
                            <svg
                                className="w-16 h-16 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
            </div>

                {/* Header Section */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        ยืนยันอีเมลของคุณ
                    </h2>
                    <p className="text-base text-gray-600 mb-2">
                        เราได้ส่งรหัสยืนยัน 6 หลักไปยังอีเมล
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                        <svg
                            className="w-5 h-5 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                            />
                        </svg>
                        <p className="text-sm font-semibold text-indigo-900">
                            {email}
                        </p>
                    </div>
                </div>

                {/* Status Messages */}
                {status === 'verification-code-sent' && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg shadow-sm">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-green-600 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-sm font-medium text-green-800">
                                ส่งรหัสยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ
                            </p>
                        </div>
                    </div>
                )}

                {errors.code && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-red-600 mr-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="text-sm font-medium text-red-800">
                                {errors.code}
                            </p>
                        </div>
                </div>
            )}

                {/* Code Input Section */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
                            กรุณากรอกรหัสยืนยัน 6 หลัก
                        </label>
                        <div className="flex justify-center gap-3 mb-6">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-16 h-16 text-center text-3xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                    style={{
                                        caretColor: 'transparent',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                        <PrimaryButton
                            type="submit"
                            disabled={processing || code.join('').length !== 6}
                            className="w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow duration-200"
                        >
                            {processing ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    กำลังยืนยัน...
                                </span>
                            ) : (
                                'ยืนยันอีเมล'
                            )}
                    </PrimaryButton>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={processing}
                            className="w-full py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            ส่งรหัสยืนยันใหม่
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center pt-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                    >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-xs text-gray-600 font-medium">
                                รหัสยืนยันจะหมดอายุใน 10 นาที
                            </p>
                        </div>
                </div>
            </form>
            </div>
        </GuestLayout>
    );
}
