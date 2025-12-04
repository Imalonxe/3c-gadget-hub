import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { TrashIcon } from '@heroicons/react/24/outline';
import { LuShoppingCart } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ cartItems, subtotal, missionDiscount, missionName, auth }) {
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

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6">
                            <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Shopping Cart</h1>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center justify-center">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                        className="mb-6 text-gray-200 dark:text-gray-700 transition-colors duration-300"
                                    >
                                        <LuShoppingCart className="w-24 h-24" />
                                    </motion.div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg transition-colors duration-300">Your cart is empty</p>
                                    <Link
                                        href={route('products.index')}
                                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {cartItems.map((item) => (
                                                <motion.div
                                                    key={item.cart_item_id}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
                                                >
                                                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden transition-colors duration-300">
                                                        <img
                                                            src={item.product?.images?.[0]?.image_url ? `/storage/${item.product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                            alt={item.product?.product_name || 'Product'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="flex-1 w-full">
                                                        <h3 className="text-lg font-medium">
                                                            <Link
                                                                href={route('products.show', item.product?.slug)}
                                                                className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                                                            >
                                                                {item.product?.product_name || 'Unknown Product'}
                                                            </Link>
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">฿{item.price_at_add}</p>
                                                    </div>

                                                    <div className="flex-shrink-0 flex items-center justify-end w-full sm:w-auto gap-6 sm:min-w-[300px]">
                                                        <div className="flex items-center gap-3">
                                                            <select
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.product.product_id, e.target.value)}
                                                                className="h-10 w-20 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                                                            >
                                                                {[...Array(Math.min(99, item.product?.stock_quantity || 1))].map((_, i) => (
                                                                    <option key={i + 1} value={i + 1}>
                                                                        {i + 1}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <button
                                                                onClick={() => removeItem(item.product.product_id)}
                                                                className="h-10 w-10 flex-shrink-0 flex items-center justify-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>

                                                        <div className="text-right w-24 flex-shrink-0">
                                                            <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                                                ฿{(item.price_at_add * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                            <span>Subtotal:</span>
                                            <span>฿{subtotal.toFixed(2)}</span>
                                        </div>

                                        {missionDiscount > 0 && (
                                            <div className="flex justify-between text-lg font-medium text-green-600 dark:text-green-400 transition-colors duration-300">
                                                <span>Mission Discount ({missionName}):</span>
                                                <span>-฿{Number(missionDiscount).toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-xl font-bold border-t border-gray-200 dark:border-gray-700 pt-4 text-gray-900 dark:text-white transition-colors duration-300">
                                            <span>Total:</span>
                                            <span>฿{(subtotal - (missionDiscount || 0)).toFixed(2)}</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-end gap-4">
                                            <Link
                                                href={route('products.index')}
                                                className="px-6 py-3 text-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                                            >
                                                Continue Shopping
                                            </Link>
                                            <Link
                                                href={route('checkout.index')}
                                                className="px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors duration-300"
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