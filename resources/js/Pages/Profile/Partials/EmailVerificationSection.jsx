import PrimaryButton from '@/Components/PrimaryButton';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function EmailVerificationSection({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const { post, processing } = useForm({});

    const isVerified = user.email_verified_at !== null;

    const sendVerification = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    if (!mustVerifyEmail) {
        return null;
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Email Verification
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    {isVerified 
                        ? 'Your email address has been verified.'
                        : 'Please verify your email address to access all features.'}
                </p>
            </header>

            <div className="mt-6">
                {isVerified ? (
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-600">
                            Email Verified
                        </span>
                        <span className="text-sm text-gray-500">
                            ({new Date(user.email_verified_at).toLocaleDateString('th-TH')})
                        </span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-yellow-600">
                                Email Not Verified
                            </span>
                        </div>

                        <p className="text-sm text-gray-600">
                            We've sent a verification link to <strong>{user.email}</strong>. 
                            Please check your email and click the link to verify your account.
                        </p>

                        <form onSubmit={sendVerification}>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Sending...' : 'Resend Verification Email'}
                            </PrimaryButton>
                        </form>

                        {status === 'verification-link-sent' && (
                            <Transition
                                show={true}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="mt-2 text-sm font-medium text-green-600">
                                    A new verification link has been sent to your email address.
                                </div>
                            </Transition>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

