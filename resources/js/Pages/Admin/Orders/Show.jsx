import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/utils/formatters';

export default function Show({ order }) {
    return (
        <AdminLayout title={`Order ${order.order_number}`}>
            <Head title={`Order ${order.order_number}`} />

            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Order Details</h2>
                        <div className="flex items-center space-x-3">
                            <a
                                href={route('admin.orders.export', order.order_id ?? order.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
                            >
                                Export PDF
                            </a>
                            <Link href={route('admin.orders.index')} className="text-sm text-gray-600">Back to list</Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Order Number</label>
                            <div className="mt-1 text-gray-900">{order.order_number}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer</label>
                            <div className="mt-1 text-gray-900">{order.user?.name || 'N/A'} &lt;{order.user?.email}&gt;</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <div className="mt-1 text-gray-900">{formatDate(order.created_at)}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount</label>
                                <div className="mt-1 text-gray-900">฿{(parseFloat(order.total_amount || order.total || 0)).toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <div className="mt-1 text-gray-900">{order.status}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                                <div className="mt-1 text-gray-900">{order.payment_status}</div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                            <div className="mt-1 text-gray-900">{order.shipping_address ? (
                                <div>
                                    <div>{order.shipping_address.full_name}</div>
                                    <div>{order.shipping_address.address_line_1}</div>
                                    <div>{order.shipping_address.city}, {order.shipping_address.postcode}</div>
                                </div>
                            ) : 'N/A'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Items</label>
                            <div className="mt-2 space-y-2">
                                {order.items && order.items.length > 0 ? order.items.map((item) => (
                                    <div key={item.id || `${item.product_id}-${item.quantity}`} className="p-3 border rounded">
                                        <div className="text-sm font-medium">{item.product?.product_name || item.name || 'Product'}</div>
                                        <div className="text-sm text-gray-600">Qty: {item.quantity} — ฿{parseFloat(item.unit_price || item.price || 0).toFixed(2)}</div>
                                    </div>
                                )) : <div className="text-sm text-gray-600">No items</div>}
                            </div>
                        </div>

                        {order.notes && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <div className="mt-1 text-gray-900 whitespace-pre-wrap">{order.notes}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
