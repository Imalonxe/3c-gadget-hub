import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';
import { TicketIcon, ArrowRightIcon, TagIcon } from '@heroicons/react/24/outline';

export default function Index({ subtotal = 0 }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const applyCoupon = async (e) => {
        e && e.preventDefault();
        setMessage(null);
        setError(null);
        if (!code.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(route('coupons.validate'), { code, subtotal, intent: 'claim' });
            if (res && res.data) {
                const data = res.data;
                const msg = data.message || 'Coupon validated';

                if (data.valid) {
                    setMessage(msg);
                    toast.success(msg);
                    setCode(''); // Clear input on success
                } else {
                    setError(msg);
                    toast.error(msg);
                }
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.errors || 'Failed to validate coupon';
            const text = typeof msg === 'string' ? msg : JSON.stringify(msg);
            setError(text);
            toast.error(text);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout fullWidth={true}>
            <Head title="Redeem Coupon" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Hero Section */}
                <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-white dark:from-indigo-900/40 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent transition-colors duration-300" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 sm:pt-32 sm:pb-40 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-indigo-100 dark:border-indigo-900/50 mb-8">
                            <TagIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl md:text-6xl mb-6">
                            Redeem Your Rewards
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                            Unlock exclusive discounts and elevate your experience with our premium rewards program.
                        </p>
                    </div>
                </div>

                {/* Content Section with Overlapping Card */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 pb-24">
                    <div className="max-w-lg mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-xl">
                            <div className="p-8 sm:p-10">
                                <form onSubmit={applyCoupon} className="space-y-8">
                                    <div>
                                        <label htmlFor="code" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 ml-1">
                                            Promo Code
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                id="code"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                                placeholder="ENTER CODE"
                                                className="block w-full rounded-2xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 p-5 text-center text-xl font-bold tracking-widest uppercase placeholder-gray-400 text-gray-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all group-hover:border-indigo-300 dark:group-hover:border-indigo-700"
                                                autoComplete="off"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white py-5 text-lg font-semibold shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200 transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Verifying...' : 'Redeem Code'}
                                    </button>
                                </form>

                                {/* Status Messages */}
                                <div className="mt-8 space-y-4">
                                    {message && (
                                        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-5 flex items-start gap-4 border border-emerald-100 dark:border-emerald-900/30">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full shrink-0">
                                                <TicketIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div className="pt-1">
                                                <p className="font-semibold text-emerald-900 dark:text-emerald-200">{message}</p>
                                                <Link href={route('coupons.all')} className="mt-2 inline-flex items-center text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors">
                                                    View in wallet <ArrowRightIcon className="ml-1 w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-5 flex items-start gap-4 border border-red-100 dark:border-red-900/30">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-600 dark:text-red-400">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="8" x2="12" y2="12" />
                                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                            </div>
                                            <p className="pt-1 font-medium text-red-900 dark:text-red-200">{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Link */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-5 text-center">
                                <Link
                                    href={route('coupons.all')}
                                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-2 group"
                                >
                                    View My Coupons <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
