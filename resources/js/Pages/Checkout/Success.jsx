import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function Success({ order }) {
    return (
        <MainLayout>
            <Head title="Order Success" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-center">
                            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Order Placed Successfully!
                            </h1>
                            
                            <p className="text-lg text-gray-600 mb-6">
                                Thank you for your order. We've received your order and will process it shortly.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                    <div>
                                        <p className="text-sm text-gray-600">Order Number</p>
                                        <p className="font-medium">{order.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Order Date</p>
                                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium capitalize">{order.order_status}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Amount</p>
                                        <p className="font-medium">฿{order.total_amount}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('user.orders.show', order.order_id)}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    View Order Details
                                </Link>
                                <Link
                                    href={route('products.index')}
                                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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