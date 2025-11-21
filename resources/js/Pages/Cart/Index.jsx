import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function Index({ cartItems, subtotal, auth }) {
    const { delete: destroy, patch } = useForm();

    const updateQuantity = (productId, quantity) => {
        patch(route('cart.update', productId), {
            quantity: parseInt(quantity)
        });
    };

    const removeItem = (productId) => {
        destroy(route('cart.remove', productId));
    };

    return (
        <MainLayout>
            <Head title="Shopping Cart" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h1 className="text-2xl font-semibold mb-6">Shopping Cart</h1>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                                    <Link
                                        href={route('products.index')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.cart_item_id} className="flex items-center space-x-4 py-4 border-b">
                                                <div className="flex-shrink-0 w-24 h-24">
                                                    <img
                                                        src={item.product?.images?.[0]?.image_url ? `/storage/${item.product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                        alt={item.product?.product_name || 'Product'}
                                                        className="w-full h-full object-cover rounded-md"
                                                        onError={(e) => {
                                                            e.target.src = '/images/placeholder.jpg';
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium">
                                                        <Link
                                                            href={route('products.show', item.product?.slug)}
                                                            className="hover:text-blue-600"
                                                        >
                                                            {item.product?.product_name || 'Unknown Product'}
                                                        </Link>
                                                    </h3>
                                                    <p className="text-gray-500">฿{item.price_at_add}</p>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    <select
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.product.product_id, e.target.value)}
                                                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    >
                                                        {[...Array(Math.min(99, item.product?.stock_quantity || 1))].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>
                                                                {i + 1}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={() => removeItem(item.product.product_id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-lg font-semibold">
                                                        ฿{(item.price_at_add * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Subtotal:</span>
                                            <span>฿{subtotal.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <Link
                                                href={route('products.index')}
                                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                                Continue Shopping
                                            </Link>
                                            <Link
                                                href={route('checkout.index')}
                                                className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                            >
                                                Proceed to Checkout
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}