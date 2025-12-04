import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';
import MainLayout from '@/Layouts/MainLayout';
import { format } from 'date-fns';

export default function OrderHistory({ orders, auth, filters = {} }) {
    // Handle paginated orders data
    const ordersData = orders?.data || orders || [];
    const [search, setSearch] = useState(filters.search || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const getStatusBadgeColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const handleCancel = async (orderId) => {
        const result = await Swal.fire({
            title: 'Cancel order?',
            text: 'Are you sure you want to cancel this order? This will restore any reserved stock.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel order',
            cancelButtonText: 'Keep order',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });

        if (result.isConfirmed) {
            router.post(route('user.orders.cancel', orderId), {
                onSuccess: () => toast.success('Order cancelled'),
                onError: () => toast.error('Failed to cancel order')
            });
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();

        router.get(route('user.orders'), {
            search: search || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined
        }, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setSearch('');
        setFromDate('');
        setToDate('');
        router.get(route('user.orders'), {}, { preserveState: true, replace: true });
    };

    return (
        <MainLayout>
            <Head title="Order History" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6">
                            <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Order History</h1>

                            {/* Filters */}
                            <form onSubmit={handleFilterSubmit} className="mb-4 flex flex-col md:flex-row md:items-end md:space-x-3 space-y-2 md:space-y-0">
                                <div className="flex-1">
                                    <label className="sr-only">Search</label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="ค้นหาชื่อสินค้า หรือ หมายเลขคำสั่งซื้อ"
                                        className="block w-full rounded-md border-gray-200 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div>
                                        <label className="sr-only">From</label>
                                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-md border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <label className="sr-only">To</label>
                                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-md border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button type="submit" className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors duration-300">Search</button>
                                        <button type="button" onClick={handleResetFilters} className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">Reset</button>
                                    </div>
                                </div>
                            </form>

                            {ordersData.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">You haven't placed any orders yet</p>
                                    <Link
                                        href={route('products.index')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {ordersData.map((order) => (
                                        <div key={order.order_id} className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors duration-300">
                                            {/* Order Header */}
                                            <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between transition-colors duration-300">
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                        {order?.created_at ? (
                                                            `Order placed on ${format(new Date(order.created_at), 'PPP')}`
                                                        ) : (
                                                            'Order date unknown'
                                                        )}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{order?.order_number ?? 'No order number'}</p>
                                                </div>
                                                <div>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order?.status)} transition-colors duration-300`}>
                                                        {order?.status ? (
                                                            order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                                        ) : (
                                                            'Unknown'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="p-4">
                                                <div className="space-y-4">
                                                    {order.items?.map((item) => (
                                                        <div key={item.order_item_id} className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-md overflow-hidden transition-colors duration-300">
                                                                <img
                                                                    src={item.product?.images?.[0]?.image_url ? `/storage/${item.product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                                    alt={item.product?.product_name || 'Product'}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = '/images/placeholder.jpg';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <Link
                                                                    href={route('products.show', item.product?.slug)}
                                                                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                                                                >
                                                                    {item.product?.product_name || 'Unknown Product'}
                                                                </Link>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Qty: {item.quantity}</p>
                                                            </div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                                                                ฿{Number((item?.unit_price ?? 0) * (item?.quantity ?? 0)).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Footer */}
                                            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between transition-colors duration-300">
                                                <div className="flex items-center space-x-4">
                                                    <Link
                                                        href={route('user.orders.show', order.order_id)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                                                    >
                                                        View Order Details
                                                    </Link>

                                                    {/* Checkout button for PromptPay orders with pending payment */}
                                                    {order.payment_method === 'promptpay' && order.payment_status === 'pending' && (
                                                        <Link
                                                            href={route('payment.show', order.order_id)}
                                                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
                                                        >
                                                            Checkout
                                                        </Link>
                                                    )}

                                                    {/* Show admin-style invoice export only for paid orders */}
                                                    {order.payment_status === 'paid' && (
                                                        <a
                                                            href={route('user.orders.export', order.order_id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
                                                        >
                                                            Export ใบเสร็จ
                                                        </a>
                                                    )}

                                                    {order.status === 'delivered' && !order.has_review && order.items?.[0] && (
                                                        <Link
                                                            href={route('products.show', order.items[0].product?.slug)}
                                                            className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-300"
                                                        >
                                                            Write a Review
                                                        </Link>
                                                    )}
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancel(order.order_id)}
                                                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-300"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Total: ฿{Number(order?.total_amount ?? 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}