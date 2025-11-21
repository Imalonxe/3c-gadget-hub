import React from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductList({ products, categories, selectedCategory, filters }) {
    // (removed per-product quantity/add-to-cart in listing; actions happen on product page)
    // If a category is selected and it has child categories, show the children
    const currentCategory = selectedCategory ? categories.find(c => c.slug === selectedCategory) : null;
    const childCategories = currentCategory ? categories.filter(c => String(c.parent_category_id) === String(currentCategory.category_id)) : [];

    return (
        <MainLayout>
            <Head title={selectedCategory ? 
                `${categories.find(c => c.slug === selectedCategory)?.category_name} Products` : 
                "All Products"
            } />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Category Navigation */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory ? 
                                    `${categories.find(c => c.slug === selectedCategory)?.category_name} Products` : 
                                    "All Products"
                                }
                            </h2>
                            <a href={route('products.index')} className="text-indigo-600 hover:text-indigo-700">
                                ← Back to Categories
                            </a>
                        </div>
                        
                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <a
                                href={route('products.list')}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    !selectedCategory
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </a>
                            {categories
                                .filter((category) => !category.is_parent)
                                .map((category) => (
                                <a
                                    key={category.category_id}
                                    href={route('products.list', { category: category.slug })}
                                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                                        selectedCategory === category.slug
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                >
                                    {category.category_name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* If current category has children, show child categories; otherwise show products */}
                    {currentCategory && childCategories.length > 0 ? (
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {childCategories.map((category) => (
                                        <a
                                            key={category.category_id}
                                            href={route('products.list', { category: category.slug })}
                                            className="group relative rounded-lg overflow-hidden h-48 md:h-56 lg:h-60 cursor-pointer"
                                        >
                                            <div
                                                className="w-full h-full bg-gray-100 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                                                style={{ backgroundImage: `url(${category.image_url || '/images/placeholder.jpg'})` }}
                                                role="img"
                                                aria-label={category.category_name}
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

                                            <div className="absolute left-4 right-4 bottom-4">
                                                <div className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg">
                                                    <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                                    <p className="text-sm opacity-90">View products</p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    <AnimatePresence>
                                    {products.data.map((product) => {
                                        const pid = product.product_id ?? product.id;
                                        return (
                                                <motion.div
                                                key={pid}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => router.visit(route('products.show', product.slug))}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.visit(route('products.show', product.slug)); } }}
                                                    className="bg-white rounded-2xl shadow-md group overflow-hidden cursor-pointer"
                                                    layout
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    whileHover={{ translateY: -6, boxShadow: '0 20px 40px rgba(2,6,23,0.12)' }}
                                                    transition={{ duration: 0.28 }}
                                                >
                                                    <div className="h-56 md:h-64 lg:h-56 relative overflow-hidden bg-white flex items-center justify-center p-4 rounded-t-2xl">
                                                                <img
                                                                    src={product.images?.[0]?.image_url ? `/storage/${product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                                    alt={product.name}
                                                                    className="max-h-full max-w-full object-contain transition-transform duration-400 transform group-hover:scale-110"
                                                                    onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                                                                />
                                                            </div>

                                                    <div className="p-4 flex flex-col min-h-[150px] bg-gray-50 rounded-b-2xl">
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                                        {product.product_name || product.name || product.title}
                                                    </h3>
                                                    {/* Description intentionally hidden on this listing page */}
                                                    <div className="text-sm text-gray-600 mb-1">Stock: {product.stock ?? product.stock_quantity ?? 0}</div>
                                                    <div className="mt-2 mb-4 flex items-center justify-between">
                                                        <p className="text-xl font-bold text-indigo-600">฿{product.sale_price || product.price}</p>
                                                        <div className="text-sm text-gray-500">ขายแล้ว <span className="font-medium text-gray-900">{product.sold_count ?? 0}</span> ชิ้น</div>
                                                    </div>
                                                </div>
                                                </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                </div>

                                {/* Pagination */}
                                {products.links && products.links.length > 3 && (
                                    <div className="mt-6 flex justify-center">
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {products.links.map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}