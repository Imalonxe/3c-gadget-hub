import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function Success({ order }) {
    return (
        <MainLayout>
            <Head title="Order Success" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6 text-center">
                            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                                Order Placed Successfully!
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                                Thank you for your order. We've received your order and will process it shortly.
                            </p>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6 transition-colors duration-300">
                                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Order Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Order Number</p>
                                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{order.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Order Date</p>
                                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Status</p>
                                        <p className="font-medium capitalize text-gray-900 dark:text-white transition-colors duration-300">{order.order_status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Total Amount</p>
                                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">฿{order.total_amount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('user.orders.show', order.order_id)}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-300"
                                >
                                    View Order Details
                                </Link>
                                <Link
                                    href={route('products.index')}
                                    className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}