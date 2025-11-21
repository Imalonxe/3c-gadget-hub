import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
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

export default function Show({ product, auth, reviews = [], sold_count = 0, rating_counts = {} }) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(Boolean(product.in_wishlist));
    const [wishlistProcessing, setWishlistProcessing] = useState(false);
    const [quantity, setQuantity] = useState(1);

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
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left column: image gallery + share buttons underneath */}
                                <div>
                                    <ProductImageGallery 
                                        images={product.images || []}
                                        productName={product.product_name || product.name}
                                    />

                                    <div className="mt-4">
                                        <div className="text-sm font-medium text-gray-700 mb-2">แชร์ไปยัง</div>
                                        <div className="flex items-center gap-3">
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
                                    <h1 className="text-3xl font-bold mb-4">{product.product_name || product.name}</h1>
                                    <div className="text-2xl font-semibold text-gray-900 mb-6">
                                        ฿{product.sale_price || product.price}
                                    </div>
                                    
                                    <div className="prose max-w-none mb-8">
                                        {/* Preserve newlines entered in admin by using whitespace utility */}
                                        <p className="whitespace-pre-line">{product.description}</p>
                                    </div>

                                    {/* Stock Status */}
                                    <div className="mb-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
                                        </span>
                                    </div>

                                    

                                    {/* Quantity controls */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">จำนวน</label>
                                        <div className="flex items-center gap-4">
                                            <div className="inline-flex items-center border rounded-lg overflow-hidden shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                                                    className="px-4 py-2 bg-white text-lg text-gray-700 hover:bg-gray-50 border-r"
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
                                                    className="w-20 text-center text-lg px-3 h-10 leading-10 focus:outline-none appearance-none no-spinner"
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
                                                    className="px-4 py-2 bg-white text-lg text-gray-700 hover:bg-gray-50 border-l"
                                                    aria-label="เพิ่มจำนวน"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-sm text-gray-500">
                                                {product.stock_quantity ? `มีในสต็อก ${product.stock_quantity} ชิ้น` : 'ไม่มีข้อมูลสต็อก'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Add to Cart (half) + Buy Now (half) + Wishlist */}
                                    <div className="flex gap-4 items-center">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.stock_quantity <= 0 || isAddingToCart}
                                            className={`w-1/2 h-12 flex items-center justify-center px-6 rounded-md text-white text-lg font-medium ${
                                                product.stock_quantity > 0 && !isAddingToCart
                                                    ? 'bg-blue-600 hover:bg-blue-700' 
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {isAddingToCart ? 'Adding...' : product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>

                                        <button
                                            onClick={handleBuyNow}
                                            disabled={product.stock_quantity <= 0}
                                            className={`w-1/2 h-12 flex items-center justify-center px-6 rounded-md text-white text-lg font-medium ${
                                                product.stock_quantity > 0
                                                    ? 'bg-green-600 hover:bg-green-700'
                                                    : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            Buy Now
                                        </button>

                                        {auth?.user && (
                                            <button
                                                onClick={() => {
                                                    if (wishlistProcessing) return;
                                                    setWishlistProcessing(true);

                                                    if (isInWishlist) {
                                                        // remove from wishlist via axios (plain JSON response expected)
                                                        axios.delete(route('wishlist.destroy', product.product_id))
                                                            .then(() => setIsInWishlist(false))
                                                            .catch(() => {/* optionally show error */})
                                                            .finally(() => setWishlistProcessing(false));
                                                    } else {
                                                        // add to wishlist via axios POST (send product_id in body)
                                                        axios.post(route('wishlist.store'), { product_id: product.product_id })
                                                            .then(() => setIsInWishlist(true))
                                                            .catch(() => {/* optionally show error */})
                                                            .finally(() => setWishlistProcessing(false));
                                                    }
                                                }}
                                                className="p-3 border rounded-md hover:bg-gray-50"
                                            >
                                                {isInWishlist ? (
                                                    <HeartSolidIcon className="h-6 w-6 text-pink-500" />
                                                ) : (
                                                    <HeartOutlineIcon className="h-6 w-6 text-gray-600" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Additional Product Information */}
                                    <div className="mt-8 border-t pt-8">
                                        <h2 className="text-lg font-semibold mb-4">Product Details</h2>
                                        <dl className="grid grid-cols-1 gap-y-4">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{product.brand}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Category</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{product.category?.category_name || 'N/A'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{product.sku}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="mt-12 border-t pt-8">
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