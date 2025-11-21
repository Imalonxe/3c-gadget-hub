import React, { useState, forwardRef } from 'react';
import { router } from '@inertiajs/react';

// Dev marker: helps confirm the latest JS bundle is loaded in the browser console
console.log('ProductCard component loaded (updated)');
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductCard = forwardRef(function ProductCard({ product, variant = 'default', className = '', ..._rest }, ref) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const increase = () => setQuantity(q => Math.min(q + 1, product.stock ?? product.stock_quantity ?? 9999));
    const decrease = () => setQuantity(q => Math.max(1, q - 1));
    const sold = product.sold ?? product.sold_count ?? product.sold_quantity ?? 0;

    if (variant === 'featured') {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col h-full ${className}`}
                onClick={() => {
                    if (product && (product.slug || product.id || product.product_id)) {
                        router.visit(route('products.show', product.slug || product.id || product.product_id));
                    }
                }}
            >
                <div className="p-4 flex-1 flex items-center justify-center">
                    <img
                        src={product.images?.[0]?.image_url ? `/storage/${product.images[0].image_url}` : '/images/placeholder.jpg'}
                        alt={product.product_name || product.name}
                        className="max-h-44 object-contain"
                        onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                    />
                </div>

                <div className="bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2">{product.product_name || product.name}</h3>

                    <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                        <div>Stock: {product.stock || 0}</div>
                        <div>ขายแล้ว {sold} ชิ้น</div>
                    </div>

                    <div className="mt-3">
                        <div className="text-lg font-bold text-indigo-600">฿{product.sale_price || product.price}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${className}`}
            onClick={() => {
                if (product && (product.slug || product.id || product.product_id)) {
                    router.visit(route('products.show', product.slug || product.id || product.product_id));
                }
            }}
        >
            <img 
                src={product.images?.[0]?.image_url ? `/storage/${product.images[0].image_url}` : '/images/placeholder.jpg'} 
                alt={product.product_name || product.name}
                className="w-full h-32 object-cover"
                onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                }}
            />
            
            <div className="p-2">
                <h3 className="text-sm font-semibold mb-1">{product.product_name || product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-lg font-bold text-gray-900">
                                ฿{product.sale_price || product.price}
                            </span>
                            <div className="text-sm text-gray-600">Stock: {product.stock || 0}</div>
                        </div>
                    </div>

                    <div className="w-full mt-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-md overflow-hidden bg-white">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); decrease(); }}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
                                >
                                    -
                                </button>
                                <div className="w-12 text-center font-medium">{quantity}</div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); increase(); }}
                                    className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200"
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
                                disabled={isAdding || (product.stock ?? product.stock_quantity ?? 0) <= 0}
                                className={`px-4 py-2 h-10 inline-flex items-center justify-center rounded-md text-white transition ${
                                    (product.stock ?? product.stock_quantity ?? 0) > 0 && !isAdding
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isAdding ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>

                        {/* Removed View Details and Buy Now buttons; entire card is clickable to view details. */}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProductCard;