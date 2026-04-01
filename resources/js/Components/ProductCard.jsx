import React, { useState, forwardRef } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';

// Dev marker: helps confirm the latest JS bundle is loaded in the browser console
console.log('ProductCard component loaded (updated)');
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductCard = forwardRef(function ProductCard({ product, variant = 'default', className = '', ..._rest }, ref) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const increase = () => setQuantity(q => Math.min(q + 1, product.stock_quantity ?? 9999));
    const decrease = () => setQuantity(q => Math.max(1, q - 1));
    const sold = product.sold ?? product.sold_count ?? product.sold_quantity ?? 0;

    // Check if product is on sale
    const isOnSale = product.sale_price && product.sale_price < product.price;
    const discountPercent = isOnSale
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    if (variant === 'featured') {
        return (
            <motion.div
                ref={ref}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full border border-gray-100 dark:border-gray-700 ${className}`}
                onClick={() => {
                    if (product && (product.slug || product.id || product.product_id)) {
                        router.visit(route('products.show', product.slug || product.id || product.product_id));
                    }
                }}
            >
                <div className="relative p-4 flex-1 flex items-center justify-center bg-white transition-colors duration-300">
                    <img
                        src={product.images?.[0]?.url ? product.images[0].url : '/images/placeholder.jpg'}
                        alt={product.product_name || product.name}
                        className="max-h-44 object-contain"
                        onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                    />

                    {/* Sale Badge */}
                    {isOnSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                            SALE -{discountPercent}%
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors duration-300">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 h-10 text-gray-900 dark:text-white transition-colors duration-300">{product.product_name || product.name}</h3>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                        Stock: {product.stock_quantity || 0}
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            {isOnSale ? (
                                <div className="space-y-1">
                                    <div className="text-sm text-gray-400 line-through">฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400 transition-colors duration-300">฿{Number(product.sale_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            ) : (
                                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 pb-1 transition-colors duration-300">ขายแล้ว <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{sold}</span> ชิ้น</div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={ref}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative border border-gray-100 dark:border-gray-700 ${className}`}
            onClick={() => {
                if (product && (product.slug || product.id || product.product_id)) {
                    router.visit(route('products.show', product.slug || product.id || product.product_id));
                }
            }}
        >
            {/* Sale Badge - Top Corner */}
            {isOnSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-md">
                    SALE -{discountPercent}%
                </div>
            )}

            <div className="bg-white p-4 flex items-center justify-center transition-colors duration-300">
                <img
                    src={product.images?.[0]?.url ? product.images[0].url : '/images/placeholder.jpg'}
                    alt={product.product_name || product.name}
                    className="w-full h-32 object-contain"
                    onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                    }}
                />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 transition-colors duration-300">
                <h3 className="text-sm font-semibold mb-1 text-gray-900 dark:text-white line-clamp-2 h-10 transition-colors duration-300">{product.product_name || product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 h-10 transition-colors duration-300">{product.description}</p>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex-1">
                            {isOnSale ? (
                                <div className="space-y-1">
                                    <div className="text-xs text-gray-400 line-through">฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400 transition-colors duration-300">฿{Number(product.sale_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                            ) : (
                                <span className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                    ฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Stock: {product.stock_quantity || 0}</div>
                        </div>
                    </div>

                    <div className="w-full pt-2 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-700 transition-colors duration-300">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); decrease(); }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-300"
                                >
                                    -
                                </button>
                                <div className="w-10 text-center font-medium text-sm text-gray-900 dark:text-white transition-colors duration-300">{quantity}</div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); increase(); }}
                                    className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-300"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!product) return;
                                    if (!product.product_id && !product.id) return;
                                    setIsAdding(true);
                                    axios.post(route('cart.add', product.product_id ?? product.id), { quantity })
                                        .then(() => {
                                            setIsAdding(false);
                                            toast.success('Added to cart');
                                        })
                                        .catch((err) => {
                                            setIsAdding(false);
                                            if (err.response && err.response.status === 401) {
                                                // not authenticated, redirect to login
                                                router.visit(route('login'));
                                                return;
                                            }
                                            toast.error('Failed to add to cart');
                                        });
                                }}
                                disabled={isAdding || (product.stock_quantity ?? 0) <= 0}
                                className={`flex-1 px-3 py-1.5 h-8 text-sm inline-flex items-center justify-center rounded-md text-white transition-colors duration-300 ${(product.stock_quantity ?? 0) > 0 && !isAdding
                                    ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                {isAdding ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default ProductCard;