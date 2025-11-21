import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import MainLayout from '@/Layouts/MainLayout';
import axios from 'axios';

export default function Index({ subtotal = 0 }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // small example coupons to help users — adjust or remove as desired
    const exampleCoupons = ['FREESP', 'WELCOME10', 'SHIPFREE'];

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
        <MainLayout>
            <Head title="Apply Coupon" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-white via-gray-50 to-white shadow-md sm:rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-md bg-indigo-50 flex items-center justify-center">
                                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l6 6-6 6" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <h1 className="text-lg font-semibold text-gray-800">Apply Coupon</h1>
                                    <p className="text-sm text-gray-500">กรอกโค้ดคูปองเพื่อรับส่วนลด</p>
                                </div>

                                <p className="mt-2 text-sm text-gray-600">Have a promo code? Enter it below to claim it to your account. Claimed coupons can be applied at checkout.</p>

                                <form onSubmit={applyCoupon} className="mt-4">
                                    <div className="flex gap-2">
                                        <input
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            placeholder="Enter coupon code"
                                            className="flex-1 border border-gray-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Checking...' : 'Claim'}
                                        </button>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <small className="text-xs text-gray-500">Subtotal:</small>
                                            <div className="text-sm font-medium">฿{Number(subtotal).toLocaleString()}</div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => { setCode(''); setMessage(null); setError(null); }}
                                                className="text-xs text-gray-500 hover:text-gray-700"
                                            >
                                                Clear
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => { const ex = exampleCoupons[Math.floor(Math.random() * exampleCoupons.length)]; setCode(ex); setMessage(null); setError(null); }}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                Try example
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        {message && (
                                            <div className="inline-flex items-center px-3 py-2 rounded-md bg-green-50 text-green-800 text-sm">
                                                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {message}
                                            </div>
                                        )}

                                        {error && (
                                            <div className="inline-flex items-center px-3 py-2 rounded-md bg-red-50 text-red-800 text-sm">
                                                <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                {error}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
