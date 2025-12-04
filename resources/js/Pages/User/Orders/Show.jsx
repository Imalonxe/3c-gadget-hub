import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { format } from 'date-fns';
import { TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function Show({ order, auth }) {
    const shipping = order.shipping_address || {};
    const formatCurrency = (value) => {
        const n = Number(value);
        if (!isFinite(n) || Number.isNaN(n)) return '0.00';
        return n.toFixed(2);
    };

    return (
        <MainLayout>
            <Head title={`Order ${order.order_number}`} />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Order Details</h1>
                                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Order #{order.order_number}</p>
                                </div>
                                <Link
                                    href={route('user.orders')}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                                >
                                    Back to Orders
                                </Link>
                            </div>

                            {/* Order Status Timeline */}
                            <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-300">
                                <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white transition-colors duration-300">Order Status</h2>
                                <div className="flex items-start justify-between w-full">
                                    {['pending', 'processing', 'shipped', 'delivered'].map((status, index, array) => {
                                        const currentStatusIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                                        const isCompleted = index <= currentStatusIndex;
                                        const isCurrent = order.status === status;

                                        return (
                                            <React.Fragment key={status}>
                                                <div className="flex flex-col items-center relative z-10">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isCurrent ? 'bg-blue-600 text-white' :
                                                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <p className="mt-2 text-sm capitalize font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">{status}</p>
                                                </div>

                                                {/* Connector Line */}
                                                {index < array.length - 1 && (
                                                    <div className={`flex-1 h-1 mx-2 mt-3.5 rounded transition-colors duration-300 ${index < currentStatusIndex ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                                                        }`}></div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Order Information */}
                                <div>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 transition-colors duration-300">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-300">Shipping Address</h3>
                                            <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                <p>{shipping.full_name ?? order.user?.name ?? '—'}</p>
                                                <p>{shipping.address ?? shipping.address_line1 ?? '—'}</p>
                                                <p>{shipping.city ?? shipping.province ?? ''}{shipping.postal_code ? `, ${shipping.postal_code}` : ''}</p>
                                                <p>{shipping.phone ?? shipping.recipient_phone ?? '—'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-300">Payment Information</h3>
                                            <div className="flex items-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                <CreditCardIcon className="h-5 w-5 mr-2" />
                                                <span className="capitalize">{order.payment_method}</span>
                                            </div>
                                            <p className={`mt-1 text-sm ${order.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                                                } transition-colors duration-300`}>
                                                Payment Status: {order.payment_status}
                                            </p>
                                        </div>

                                        {(order.tracking_number || order.shipping_method) && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white transition-colors duration-300">Shipping Information</h3>
                                                <div className="flex flex-col text-gray-600 dark:text-gray-400 transition-colors duration-300">
                                                    <div className="flex items-center">
                                                        <TruckIcon className="h-5 w-5 mr-2" />
                                                        {order.shipping_method ? (
                                                            <span className="capitalize">Method: {order.shipping_method}</span>
                                                        ) : (
                                                            <span className="capitalize">Method: —</span>
                                                        )}
                                                    </div>

                                                    {order.tracking_number && (
                                                        <div className="flex items-center mt-2">
                                                            <TruckIcon className="h-5 w-5 mr-2 opacity-0" />
                                                            <span>Tracking Number: {order.tracking_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors duration-300">
                                        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white transition-colors duration-300">Order Items</h3>
                                        <div className="space-y-4">
                                            {order.items.map((item) => {
                                                // Use product relation when available, otherwise fall back
                                                // to the denormalized product_name stored on the order item.
                                                const prod = item.product || {};
                                                const productName = prod.product_name || prod.name || item.product_name || item.name || 'Product';
                                                const productSlug = prod.slug || prod.product_slug || item.product_slug || null;
                                                const imageUrl = prod.images && prod.images[0] && prod.images[0].image_url ? `/storage/${prod.images[0].image_url}` : '/images/placeholder.jpg';

                                                return (
                                                    <div key={item.id || `${item.product_id}-${item.quantity}`} className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden transition-colors duration-300">
                                                            <img
                                                                src={imageUrl}
                                                                alt={productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            {productSlug ? (
                                                                <Link
                                                                    href={route('products.show', productSlug)}
                                                                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                                                                >
                                                                    {productName}
                                                                </Link>
                                                            ) : (
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{productName}</div>
                                                            )}
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Qty: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                                                            {formatCurrency(Number(item.unit_price) * Number(item.quantity))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors duration-300">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Subtotal</span>
                                                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{formatCurrency(order.subtotal)}</span>
                                                </div>

                                                {Number(order.discount) > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-green-600 dark:text-green-400 transition-colors duration-300">Discount</span>
                                                        <span className="font-medium text-green-600 dark:text-green-400 transition-colors duration-300">-{formatCurrency(order.discount)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Shipping</span>
                                                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                                                        {order.is_level_free_shipping ? (
                                                            <span className="text-green-600 dark:text-green-400">Free (Level Benefit)</span>
                                                        ) : Number(order.shipping_fee) === 0 ? (
                                                            <span className="text-green-600 dark:text-green-400">Free</span>
                                                        ) : (
                                                            formatCurrency(order.shipping_fee)
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Tax</span>
                                                    <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{formatCurrency(order.tax)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                                    <span>Total</span>
                                                    <span>{formatCurrency(order.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}