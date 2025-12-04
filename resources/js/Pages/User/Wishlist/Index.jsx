import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

export default function Index({ wishlistItems, auth }) {
    const handleRemove = async (productId) => {
        const result = await Swal.fire({
            title: 'Remove item?',
            text: 'Remove this item from your wishlist?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        });

        if (result.isConfirmed) {
            router.delete(route('wishlist.destroy', productId), {
                onSuccess: () => {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    });

                    Toast.fire({
                        icon: 'success',
                        title: 'Item removed from wishlist'
                    });
                },
                onError: () => {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });

                    Toast.fire({
                        icon: 'error',
                        title: 'Failed to remove item'
                    });
                }
            });
        }
    };

    const handleMoveToCart = (productId) => {
        router.post(route('wishlist.moveToCart', productId));
    };

    return (
        <MainLayout>
            <Head title="My Wishlist" />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg transition-colors duration-300">
                        <div className="p-6">
                            <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white transition-colors duration-300">My Wishlist</h1>

                            {wishlistItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4 transition-colors duration-300">
                                        <HeartIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">Your wishlist is empty</p>
                                    <Link
                                        href={route('products.index')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
                                    >
                                        Discover Products
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {wishlistItems.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
                                            <Link href={route('products.show', item.product.slug)}>
                                                <img
                                                    src={item.product?.images?.[0]?.image_url ? `/storage/${item.product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                    alt={item.product?.name}
                                                    className="w-full h-48 object-cover"
                                                />
                                            </Link>

                                            <div className="p-4">
                                                <Link
                                                    href={route('products.show', item.product.slug)}
                                                    className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                                                    ฿{item.product.price}
                                                </p>

                                                {/* Stock Status with quantity */}
                                                <p className={`mt-2 text-sm ${item.product.in_stock
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                    } transition-colors duration-300`}>
                                                    {item.product.in_stock
                                                        ? `In Stock — ${typeof item.product.stock_quantity !== 'undefined' ? item.product.stock_quantity : 'N/A'} pcs`
                                                        : 'Out of Stock'
                                                    }
                                                </p>

                                                <div className="mt-4 flex space-x-2">
                                                    <button
                                                        onClick={() => handleMoveToCart(item.product.product_id)}
                                                        disabled={!item.product.in_stock}
                                                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${item.product.in_stock
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(item.product.product_id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 border border-gray-200 dark:border-gray-600 rounded-md transition-colors duration-300"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
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