import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { TicketIcon, TagIcon, CalendarIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import MainLayout from '@/Layouts/MainLayout';

export default function Library({ coupons }) {
    const couponList = Array.isArray(coupons?.data)
        ? coupons.data
        : Array.isArray(coupons)
            ? coupons
            : [];

    return (
        <MainLayout>
            <Head title="All Coupons" />

            <div className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors duration-300">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg transition-colors duration-300">
                                <TicketIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Available Coupons</h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 ml-14 transition-colors duration-300">Choose a coupon and start saving on your next purchase</p>
                    </div>

                    {couponList.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 transition-colors duration-300">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="relative">
                                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 shadow-inner transition-colors duration-300">
                                        <TicketIcon className="w-12 h-12 text-gray-400 dark:text-gray-300" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-300">
                                        <SparklesIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                                    </div>
                                </div>
                                <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">ยังไม่มีคูปองให้ใช้ตอนนี้</p>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm transition-colors duration-300">กลับมาดูใหม่อีกครั้งเร็ว ๆ นี้ หรือติดตามโปรโมชั่นพิเศษจากเรา</p>
                                <Link
                                    href={route('products.list')}
                                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors duration-300"
                                >
                                    <ShoppingBagIcon className="w-4 h-4" />
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {couponList.map((coupon) => {
                                const isPercentage = coupon.type === 'percentage';
                                const discountValue = isPercentage ? `${coupon.value}%` : `฿${Number(coupon.value).toLocaleString()}`;

                                return (
                                    <div
                                        key={coupon.id ?? coupon.coupon_id}
                                        className="group relative bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-300 overflow-hidden hover:shadow-lg"
                                    >
                                        {/* Decorative corner */}
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-transparent dark:from-indigo-900/20 dark:to-transparent opacity-50 rounded-bl-full transition-colors duration-300" />

                                        <div className="relative p-6">
                                            {/* Header with code and discount */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <TagIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Promo Code</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono tracking-tight transition-colors duration-300">
                                                        {coupon.code}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">{coupon.name}</p>
                                                </div>

                                                {/* Discount badge */}
                                                <div className="flex-shrink-0 ml-4">
                                                    <div className="relative">
                                                        <div className="px-4 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-lg shadow-md transition-colors duration-300">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-white leading-none">
                                                                    {discountValue}
                                                                </div>
                                                                <div className="text-xs text-indigo-100 mt-0.5">OFF</div>
                                                            </div>
                                                        </div>
                                                        {/* Small decorative dot */}
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800 transition-colors duration-300" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {coupon.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed transition-colors duration-300">
                                                    {coupon.description}
                                                </p>
                                            )}

                                            {/* Details */}
                                            <div className="space-y-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
                                                {coupon.min_order_amount && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <ShoppingBagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                        <span className="text-gray-600 dark:text-gray-400">Min order:</span>
                                                        <span className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                                            ฿{Number(coupon.min_order_amount).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 text-sm">
                                                    <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                    {coupon.expires_at ? (
                                                        <>
                                                            <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                                                            <span className="text-gray-900 dark:text-white transition-colors duration-300">
                                                                {new Date(coupon.expires_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-green-600 dark:text-green-400 font-medium">No expiry date</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Apply button */}
                                            <Link
                                                href={route('products.list')}
                                                className="block w-full text-center px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200 group-hover:shadow-md"
                                            >
                                                Apply Now
                                            </Link>
                                        </div>

                                        {/* Perforated edge effect */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 dark:bg-gray-800 rounded-full -ml-2 border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300" />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 dark:bg-gray-800 rounded-full -mr-2 border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination (if using paginated response) */}
                    {coupons?.links && (
                        <div className="mt-6">{/* Inertia pagination could be added here */}</div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}