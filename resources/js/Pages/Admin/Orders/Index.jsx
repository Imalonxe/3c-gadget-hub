
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { ChevronUpIcon, ChevronDownIcon, PencilSquareIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

export default function OrdersIndex({ orders, filters, statistics }) {
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

    const search = (searchTerm) => {
        router.get(route('admin.orders.index'), {
            ...filters,
            search: searchTerm
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleFilterChange = (key, value) => {
        router.get(route('admin.orders.index'), {
            ...filters,
            [key]: value
        }, {
            preserveState: true,
            replace: true
        });
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedOrders(orders.data.map(order => order.order_id || order.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const toggleSelectOrder = (orderId) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    const handleBulkUpdate = () => {
        if (!bulkStatus || selectedOrders.length === 0) return;

        Swal.fire({
            title: 'Update Orders?',
            text: `Are you sure you want to update ${selectedOrders.length} orders to ${bulkStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update them!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.orders.bulk-update'), {
                    ids: selectedOrders,
                    status: bulkStatus
                }, {
                    onSuccess: () => {
                        setSelectedOrders([]);
                        setBulkStatus('');
                        Swal.fire(
                            'Updated!',
                            `Orders have been updated to ${bulkStatus}.`,
                            'success'
                        );
                    },
                    onError: () => {
                        Swal.fire(
                            'Error!',
                            'Something went wrong.',
                            'error'
                        );
                    }
                });
            }
        });
    };

    const handleBulkPrint = () => {
        if (selectedOrders.length === 0) return;

        // Create a form to submit post request for download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.orders.bulk-export-pdf');

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        // Add IDs
        selectedOrders.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'ids[]';
            input.value = id;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
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
        <>
            <div className="w-full py-6 px-6 sm:px-8 lg:px-12">
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

                    {/* Filters */}
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    defaultValue={filters.search || ''}
                                    onKeyPress={(e) => e.key === 'Enter' && search(e.target.value)}
                                    onBlur={(e) => search(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <input
                                    type="date"
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={filters.from_date || ''}
                                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                />
                                <input
                                    type="date"
                                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={filters.to_date || ''}
                                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedOrders.length > 0 && (
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-indigo-50 p-3 rounded-md border border-indigo-100 animate-fade-in-down gap-3">
                            <span className="text-indigo-700 font-medium">{selectedOrders.length} orders selected</span>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <select
                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 flex-1 sm:flex-none"
                                        value={bulkStatus}
                                        onChange={(e) => setBulkStatus(e.target.value)}
                                    >
                                        <option value="">Change Status To...</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                    <button
                                        onClick={handleBulkUpdate}
                                        disabled={!bulkStatus}
                                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Apply
                                    </button>
                                </div>
                                <div className="hidden sm:block h-6 w-px bg-indigo-200 mx-2"></div>
                                <button
                                    onClick={handleBulkPrint}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 text-sm rounded hover:bg-indigo-50 w-full sm:w-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Invoices
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders Table */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                    <div className="overflow-x-auto rounded-lg" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
                        <table className="w-full min-w-[1000px] divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            onChange={toggleSelectAll}
                                            checked={orders.data.length > 0 && selectedOrders.length === orders.data.length}
                                        />
                                    </th>
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
                                    <tr key={order.order_id || order.id} className={selectedOrders.includes(order.order_id || order.id) ? 'bg-indigo-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                checked={selectedOrders.includes(order.order_id || order.id)}
                                                onChange={() => toggleSelectOrder(order.order_id || order.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.orders.edit', order.order_id ?? order.id)}
                                                    className="hover:text-indigo-600"
                                                >
                                                    {order.order_number}
                                                </Link>
                                                {order.mission && (
                                                    <div className="group relative">
                                                        <SparklesIcon className="w-4 h-4 text-purple-500" />
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                            Synergy Loadout: {order.mission.name}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.user?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatCurrency(order.total_amount || order.total || 0)}
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
                                            <div className="flex items-center justify-end space-x-3">
                                                <Link
                                                    href={route('admin.orders.show', order.order_id ?? order.id)}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="View Order"
                                                >
                                                    <EyeIcon className="w-5 h-5" strokeWidth={1.5} />
                                                </Link>
                                                <Link
                                                    href={route('admin.orders.edit', order.order_id ?? order.id)}
                                                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                    title="Edit Order"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" strokeWidth={1.5} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
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
                                        className={`px-3 py-2 border rounded-md ${link.active
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
        </>
    );
}

OrdersIndex.layout = page => <AdminLayout children={page} title="Orders" />;

function getStatusColor(status) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'processing':
            return 'bg-blue-100 text-blue-800';
        case 'shipped':
            return 'bg-indigo-100 text-indigo-800';
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getPaymentStatusColor(status) {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

