import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate } from '@/utils/formatters';

export default function OrdersIndex({ orders, filters, statistics }) {
    const search = (searchTerm) => {
        router.get(route('admin.orders.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout title="Orders">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                    </div>

                    {/* Statistics */}
                    {statistics && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="text-sm font-medium text-gray-500">Total Orders</div>
                                <div className="text-2xl font-semibold text-gray-900">{statistics.total || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="text-sm font-medium text-gray-500">Pending</div>
                                <div className="text-2xl font-semibold text-yellow-600">{statistics.pending || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="text-sm font-medium text-gray-500">Processing</div>
                                <div className="text-2xl font-semibold text-blue-600">{statistics.processing || 0}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow">
                                <div className="text-sm font-medium text-gray-500">Delivered</div>
                                <div className="text-2xl font-semibold text-green-600">{statistics.delivered || 0}</div>
                            </div>
                        </div>
                    )}

                    <div className="mb-4 flex justify-between items-center">
                        <div className="flex-1 max-w-md flex items-center gap-3">
                            <input
                                id="admin-orders-search"
                                type="text"
                                placeholder="Search orders..."
                                className="w-full px-4 py-2 border rounded-md"
                                defaultValue={filters.search || ''}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        search(e.target.value);
                                    }
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => search(document.getElementById('admin-orders-search').value)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders && orders.data && orders.data.length > 0 ? orders.data.map((order) => (
                                    <tr key={order.order_id || order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <Link
                                                    href={route('admin.orders.edit', order.order_id ?? order.id)}
                                                    className="hover:text-indigo-600"
                                                >
                                                    {order.order_number}
                                                </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.user?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${ (typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount || order.total || 0)) .toFixed(2) }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}
                                            >
                                                {order.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        href={route('admin.orders.edit', order.order_id ?? order.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                                                    >
                                                        Edit
                                                    </Link>

                                                    <Link
                                                        href={route('admin.orders.show', order.order_id ?? order.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.links && (
                        <div className="mt-4 flex justify-center">
                            <div className="flex space-x-2">
                                {orders.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-2 border rounded-md ${
                                            link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

