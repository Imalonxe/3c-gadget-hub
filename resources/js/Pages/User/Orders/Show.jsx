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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-2xl font-semibold">Order Details</h1>
                                    <p className="text-gray-600">Order #{order.order_number}</p>
                                </div>
                                <Link
                                    href={route('user.orders')}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Back to Orders
                                </Link>
                            </div>

                            {/* Order Status Timeline */}
                            <div className="mb-8 border rounded-lg p-4">
                                <h2 className="text-lg font-medium mb-4">Order Status</h2>
                                <div className="flex items-center justify-between">
                                    {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => (
                                        <div key={status} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                order.status === status ? 'bg-blue-600 text-white' :
                                                index <= ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status)
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-200 text-gray-400'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <p className="mt-2 text-sm capitalize">{status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Order Information */}
                                <div>
                                    <div className="border rounded-lg p-4 space-y-4">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                                            <div className="text-gray-600">
                                                <p>{shipping.full_name ?? order.user?.name ?? '—'}</p>
                                                <p>{shipping.address ?? shipping.address_line1 ?? '—'}</p>
                                                <p>{shipping.city ?? shipping.province ?? ''}{shipping.postal_code ? `, ${shipping.postal_code}` : ''}</p>
                                                <p>{shipping.phone ?? shipping.recipient_phone ?? '—'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                                            <div className="flex items-center text-gray-600">
                                                <CreditCardIcon className="h-5 w-5 mr-2" />
                                                <span className="capitalize">{order.payment_method}</span>
                                            </div>
                                            <p className={`mt-1 text-sm ${
                                                order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                                Payment Status: {order.payment_status}
                                            </p>
                                        </div>

                                        {(order.tracking_number || order.shipping_method) && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
                                                <div className="flex flex-col text-gray-600">
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
                                    <div className="border rounded-lg p-4">
                                        <h3 className="text-lg font-medium mb-4">Order Items</h3>
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
                                                        <div className="flex-shrink-0 w-16 h-16">
                                                            <img
                                                                src={imageUrl}
                                                                alt={productName}
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            {productSlug ? (
                                                                <Link
                                                                    href={route('products.show', productSlug)}
                                                                    className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                                                >
                                                                    {productName}
                                                                </Link>
                                                            ) : (
                                                                <div className="text-sm font-medium text-gray-900">{productName}</div>
                                                            )}
                                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatCurrency(Number(item.unit_price) * Number(item.quantity))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 border-t pt-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Subtotal</span>
                                                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Shipping</span>
                                                    <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Tax</span>
                                                    <span className="font-medium">{formatCurrency(order.tax)}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-semibold">
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