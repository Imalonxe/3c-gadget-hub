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
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            router.delete(route('wishlist.destroy', productId), {
                onSuccess: () => toast.success('Removed from wishlist'),
                onError: () => toast.error('Failed to remove')
            });
        }
    };

    const handleMoveToCart = (productId) => {
        router.post(route('wishlist.moveToCart', productId));
    };

    return (
        <MainLayout>
            <Head title="My Wishlist" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>

                            {wishlistItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                        <HeartIcon className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-4">Your wishlist is empty</p>
                                    <Link
                                        href={route('products.index')}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Discover Products
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {wishlistItems.map((item) => (
                                        <div key={item.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
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
                                                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                                    ฿{item.product.price}
                                                </p>
                                                
                                                {/* Stock Status with quantity */}
                                                <p className={`mt-2 text-sm ${
                                                    item.product.in_stock 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                }`}>
                                                    {item.product.in_stock 
                                                        ? `In Stock — ${typeof item.product.stock_quantity !== 'undefined' ? item.product.stock_quantity : 'N/A'} pcs`
                                                        : 'Out of Stock'
                                                    }
                                                </p>

                                                <div className="mt-4 flex space-x-2">
                                                    <button
                                                        onClick={() => handleMoveToCart(item.product.product_id)}
                                                        disabled={!item.product.in_stock}
                                                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                                                            item.product.in_stock
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(item.product.product_id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 border rounded-md"
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