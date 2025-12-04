import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    WhatsappShareButton,
    WhatsappIcon,
    TelegramShareButton,
    TelegramIcon,
    LinkedinShareButton,
    LinkedinIcon
} from 'react-share';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MainLayout from '@/Layouts/MainLayout';
import ReviewSection from '@/Components/ReviewSection';
import ProductImageGallery from '@/Components/ProductImageGallery';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HiBell } from 'react-icons/hi';

export default function Show({ product, auth, reviews = [], sold_count = 0, rating_counts = {}, average_rating = 0, total_reviews = 0 }) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(Boolean(product.in_wishlist));
    const [hasPriceAlert, setHasPriceAlert] = useState(Boolean(product.has_price_alert));
    const [wishlistProcessing, setWishlistProcessing] = useState(false);
    const [quantity, setQuantity] = useState(1);

    // Ensure product has average_rating and total_reviews
    if (!product.average_rating) {
        product.average_rating = average_rating;
    }
    if (!product.total_reviews) {
        product.total_reviews = total_reviews;
    }

    const handleAddToCart = () => {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }

        // Ensure quantity is at least 1 and not more than stock
        let qty = Number(quantity) || 1;
        const maxStock = Number(product.stock_quantity) || 0;
        if (maxStock > 0) qty = Math.min(qty, maxStock);

        setIsAddingToCart(true);

        // Use axios here so we accept plain JSON responses from the server
        axios.post(route('cart.add', product.product_id), { quantity: qty })
            .then((res) => {
                setIsAddingToCart(false);
                // server returns JSON { message: 'Item added to cart successfully.' }
                toast.success(res?.data?.message || 'Added to cart');
            })
            .catch((err) => {
                setIsAddingToCart(false);
                if (err.response && err.response.status === 401) {
                    router.visit(route('login'));
                    return;
                }
                toast.error('Failed to add to cart');
            });
    };
    const handleBuyNow = () => {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }

        // Navigate to checkout with buy_now params for this product
        router.visit(route('checkout.index', { buy_now: 1, product: product.product_id, quantity: Number(quantity) || 1 }));
    };
    return (
        <MainLayout>
            <Head title={product.product_name || product.name} />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left column: image gallery + share buttons underneath */}
                                <div>
                                    <ProductImageGallery
                                        images={product.images || []}
                                        productName={product.product_name || product.name}
                                    />

                                    <div className="mt-4">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">แชร์ไปยัง</div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <FacebookShareButton url={typeof window !== 'undefined' ? window.location.href : ''} quote={product.product_name || product.name}>
                                                <FacebookIcon size={36} round />
                                            </FacebookShareButton>

                                            <TwitterShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={product.product_name || product.name}>
                                                <TwitterIcon size={36} round />
                                            </TwitterShareButton>

                                            <WhatsappShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={product.product_name || product.name} separator=" - ">
                                                <WhatsappIcon size={36} round />
                                            </WhatsappShareButton>

                                            <TelegramShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={product.product_name || product.name}>
                                                <TelegramIcon size={36} round />
                                            </TelegramShareButton>

                                            <LinkedinShareButton url={typeof window !== 'undefined' ? window.location.href : ''} title={product.product_name || product.name}>
                                                <LinkedinIcon size={36} round />
                                            </LinkedinShareButton>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div>
                                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">{product.product_name || product.name}</h1>
                                    <div className="mb-6">
                                        {product.sale_price && product.sale_price < product.price ? (
                                            <div className="flex items-end gap-3">
                                                <div className="text-3xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">
                                                    ฿{Number(product.sale_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-lg text-gray-400 dark:text-gray-500 line-through mb-1 transition-colors duration-300">
                                                    ฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-sm font-medium text-red-500 dark:text-red-400 mb-1 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded transition-colors duration-300">
                                                    -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                                ฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="prose max-w-none mb-8 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                        {/* Preserve newlines entered in admin by using whitespace utility */}
                                        <p className="whitespace-pre-line">{product.description}</p>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="mb-6">
                                        {product.stock_quantity > 0 ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-medium text-green-700 dark:text-green-400 transition-colors duration-300">In Stock</span>
                                                </div>
                                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{product.stock_quantity} units available</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium text-red-700 dark:text-red-400 transition-colors duration-300">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">จำนวน</label>
                                        <div className="flex items-center gap-4">
                                            <div className="inline-flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm transition-colors duration-300">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                                                    className="px-4 py-2 bg-white dark:bg-gray-700 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-r border-gray-300 dark:border-gray-600 transition-colors duration-300"
                                                    aria-label="ลดจำนวน"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        let v = Number(e.target.value) || 1;
                                                        const maxStock = Number(product.stock_quantity) || 0;
                                                        if (maxStock > 0) v = Math.min(v, maxStock);
                                                        if (v < 1) v = 1;
                                                        setQuantity(v);
                                                    }}
                                                    className="w-20 text-center text-lg px-3 h-10 leading-10 focus:outline-none appearance-none no-spinner bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300"
                                                    aria-label="จำนวนสินค้า"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const maxStock = Number(product.stock_quantity) || 0;
                                                        setQuantity((q) => {
                                                            const next = Number(q) + 1 || 1;
                                                            return maxStock > 0 ? Math.min(next, maxStock) : next;
                                                        });
                                                    }}
                                                    className="px-4 py-2 bg-white dark:bg-gray-700 text-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-l border-gray-300 dark:border-gray-600 transition-colors duration-300"
                                                    aria-label="เพิ่มจำนวน"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                {product.stock_quantity ? `มีในสต็อก ${product.stock_quantity} ชิ้น` : 'ไม่มีข้อมูลสต็อก'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Add to Cart (half) + Buy Now (half) + Wishlist */}
                                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleAddToCart}
                                            disabled={product.stock_quantity <= 0 || isAddingToCart}
                                            className={`w-full sm:w-1/2 h-12 flex items-center justify-center px-6 rounded-md text-white text-lg font-medium transition-colors duration-300 ${product.stock_quantity > 0 && !isAddingToCart
                                                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                                }`}
                                        >
                                            {isAddingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleBuyNow}
                                            disabled={product.stock_quantity <= 0}
                                            className={`w-full sm:w-1/2 h-12 flex items-center justify-center px-6 rounded-md text-white text-lg font-medium transition-colors duration-300 ${product.stock_quantity > 0
                                                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                                                : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                                }`}
                                        >
                                            Buy Now
                                        </motion.button>

                                        {auth?.user && (
                                            <>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => {
                                                        if (wishlistProcessing) return;
                                                        setWishlistProcessing(true);

                                                        if (isInWishlist) {
                                                            // remove from wishlist via axios (plain JSON response expected)
                                                            axios.delete(route('wishlist.destroy', product.product_id))
                                                                .then(() => setIsInWishlist(false))
                                                                .catch(() => {/* optionally show error */ })
                                                                .finally(() => setWishlistProcessing(false));
                                                        } else {
                                                            // add to wishlist via axios POST (send product_id in body)
                                                            axios.post(route('wishlist.store'), { product_id: product.product_id })
                                                                .then(() => setIsInWishlist(true))
                                                                .catch(() => {/* optionally show error */ })
                                                                .finally(() => setWishlistProcessing(false));
                                                        }
                                                    }}
                                                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-center items-center sm:w-auto transition-colors duration-300"
                                                    title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                                >
                                                    <motion.div
                                                        initial={false}
                                                        animate={{ scale: isInWishlist ? [1, 1.2, 1] : 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {isInWishlist ? (
                                                            <HeartSolidIcon className="h-6 w-6 text-pink-500" />
                                                        ) : (
                                                            <HeartOutlineIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                        )}
                                                    </motion.div>
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => {
                                                        if (hasPriceAlert) {
                                                            // For now, we don't have a direct delete endpoint by product ID easily accessible without ID lookup, 
                                                            // but we can just toggle or show a message. 
                                                            // Actually, let's just allow adding for now or simple toggle if we had the ID.
                                                            // Since we don't have the alert ID here easily without fetching, let's just support ADDING for this MVP 
                                                            // or assume we can't easily remove from here without more work.
                                                            // Wait, I can just hit the store endpoint and handle "already exists" or just let them know.
                                                            // Better: Just show "Alert Set" and disable? Or allow setting again?
                                                            // Let's just allow setting.
                                                            toast.success('Price alert is already active.');
                                                        } else {
                                                            axios.post(route('price-alerts.store'), { product_id: product.product_id })
                                                                .then(() => {
                                                                    setHasPriceAlert(true);
                                                                    toast.success('Price alert set! We will notify you when the price drops.');
                                                                })
                                                                .catch(() => toast.error('Failed to set price alert.'));
                                                        }
                                                    }}
                                                    className={`p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-center items-center sm:w-auto transition-colors duration-300 ${hasPriceAlert ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' : ''}`}
                                                    title="Notify me when price drops"
                                                >
                                                    <HiBell className={`h-6 w-6 ${hasPriceAlert ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'}`} />
                                                </motion.button>
                                            </>
                                        )}
                                    </div>

                                    {/* Additional Product Information */}
                                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 transition-colors duration-300">
                                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Product Details</h2>
                                        <dl className="grid grid-cols-1 gap-y-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Brand</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 transition-colors duration-300">{product.brand}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Category</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 transition-colors duration-300">{product.category?.category_name || 'N/A'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">SKU</dt>
                                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300 transition-colors duration-300">{product.sku}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 transition-colors duration-300">
                                <ReviewSection
                                    product={product}
                                    reviews={reviews}
                                    userReview={product.user_review}
                                    canReview={product.can_review}
                                    sold_count={sold_count}
                                    rating_counts={rating_counts}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}