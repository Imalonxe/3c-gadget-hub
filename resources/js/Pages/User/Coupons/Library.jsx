import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { TicketIcon } from '@heroicons/react/24/outline';
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

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <h1 className="text-2xl font-semibold mb-6">Available Coupons</h1>

                        {couponList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 shadow-inner">
                                    <TicketIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="mt-4 text-lg font-semibold text-gray-700">ยังไม่มีคูปองให้ใช้ตอนนี้</p>
                                <p className="mt-1 text-sm text-gray-500">กลับมาดูใหม่อีกครั้งเร็ว ๆ นี้นะ</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {couponList.map((coupon) => (
                                    <div key={coupon.id ?? coupon.coupon_id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-150 overflow-hidden">
                                        <div className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{coupon.code} <span className="text-gray-500 font-medium">— {coupon.name}</span></h3>
                                                    <p className="mt-2 text-sm text-gray-600 line-clamp-3">{coupon.description || '-'}</p>
                                                </div>
                                                <div className="ml-4 text-right">
                                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                                                        {coupon.type === 'fixed' ? `฿${Number(coupon.value).toFixed(0)}` : `${coupon.value}%`}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="text-sm text-gray-500">
                                                    {coupon.expires_at ? (
                                                        <div>Expires: <span className="text-gray-400">{new Date(coupon.expires_at).toLocaleString()}</span></div>
                                                    ) : (
                                                        <div className="text-gray-400">No expiry</div>
                                                    )}
                                                    {coupon.min_order_amount ? (
                                                        <div className="mt-1">Min order: <span className="font-medium text-gray-700">฿{Number(coupon.min_order_amount).toFixed(0)}</span></div>
                                                    ) : null}
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <Link
                                                        href={route('products.list')}
                                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                                                    >
                                                        Apply
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination (if using paginated response) */}
                        {coupons?.links && (
                            <div className="mt-6">{/* Inertia pagination could be added here */}</div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
