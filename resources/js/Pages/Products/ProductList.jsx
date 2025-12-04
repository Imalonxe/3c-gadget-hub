import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ProductList({ products, categories, selectedCategory, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');

    // If a category is selected and it has child categories, show the children
    const currentCategory = selectedCategory ? categories.find(c => c.slug === selectedCategory) : null;
    const childCategories = currentCategory ? categories.filter(c => String(c.parent_category_id) === String(currentCategory.category_id)) : [];

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search: searchQuery };
        if (selectedCategory) params.category = selectedCategory;
        router.get(route('products.list'), params);
    };

    const clearSearch = () => {
        setSearchQuery('');
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        router.get(route('products.list'), params);
    };

    return (
        <>
            <Head title={selectedCategory ?
                `${categories.find(c => c.slug === selectedCategory)?.category_name} Products` :
                "All Products"
            } />

            <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Category Navigation */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                {selectedCategory ?
                                    `${categories.find(c => c.slug === selectedCategory)?.category_name} Products` :
                                    "All Products"
                                }
                            </h2>
                            <Link href={route('products.index')} className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300">
                                ← Back to Categories
                            </Link>
                        </div>

                        {/* Search Box */}
                        <div className="mb-6">
                            <form onSubmit={handleSearch} className="relative max-w-xl">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products by name or brand..."
                                        className="block w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-300"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute inset-y-0 right-16 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                                        >
                                            <span className="text-xl">×</span>
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <Link
                                href={route('products.list')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${!selectedCategory
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All
                            </Link>
                            {categories
                                .filter((category) => !category.is_parent)
                                .map((category) => (
                                    <Link
                                        key={category.category_id}
                                        href={route('products.list', { category: category.slug })}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${selectedCategory === category.slug
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {category.category_name}
                                    </Link>
                                ))}
                        </div>
                    </div>

                    {/* If current category has children, show child categories; otherwise show products */}
                    {currentCategory && childCategories.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden transition-colors duration-300">
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {childCategories.map((category) => (
                                        <Link
                                            key={category.category_id}
                                            href={route('products.list', { category: category.slug })}
                                            className="group relative rounded-lg overflow-hidden h-48 md:h-56 lg:h-60 cursor-pointer"
                                        >
                                            <div
                                                className="w-full h-full bg-gray-100 dark:bg-gray-700 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
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
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden transition-colors duration-300">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    <AnimatePresence>
                                        {products.data.map((product) => {
                                            const pid = product.product_id ?? product.id;
                                            const isOnSale = product.sale_price && product.sale_price < product.price;
                                            const discountPercent = isOnSale ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

                                            return (
                                                <motion.div
                                                    key={pid}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => router.visit(route('products.show', product.slug))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.visit(route('products.show', product.slug)); } }}
                                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md group overflow-hidden cursor-pointer relative border border-gray-100 dark:border-gray-700 transition-all duration-300"
                                                    layout
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    whileHover={{ translateY: -6, boxShadow: '0 20px 40px rgba(2,6,23,0.12)' }}
                                                    transition={{ duration: 0.28 }}
                                                >
                                                    {/* Sale Badge */}
                                                    {isOnSale && (
                                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-md">
                                                            SALE -{discountPercent}%
                                                        </div>
                                                    )}

                                                    <div className="h-56 md:h-64 lg:h-56 relative overflow-hidden bg-white flex items-center justify-center p-4 rounded-t-2xl">
                                                        <img
                                                            src={product.images?.[0]?.image_url ? `/storage/${product.images[0].image_url}` : '/images/placeholder.jpg'}
                                                            alt={product.name}
                                                            className="max-h-full max-w-full object-contain transition-transform duration-400 transform group-hover:scale-110"
                                                            onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                                                        />
                                                    </div>

                                                    <div className="p-4 flex flex-col min-h-[150px] bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl transition-colors duration-300">
                                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 h-10 transition-colors duration-300">
                                                            {product.product_name || product.name || product.title}
                                                        </h3>
                                                        {/* Description intentionally hidden on this listing page */}
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 transition-colors duration-300">Stock: {product.stock ?? product.stock_quantity ?? 0}</div>
                                                        <div className="mt-auto flex items-end justify-between">
                                                            <div>
                                                                {isOnSale ? (
                                                                    <div className="space-y-1">
                                                                        <div className="text-xs text-gray-400 line-through">฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                        <p className="text-xl font-bold text-red-600 dark:text-red-400 transition-colors duration-300">฿{Number(product.sale_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors duration-300">฿{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 pb-1 transition-colors duration-300">ขายแล้ว <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{product.sold_count ?? 0}</span> ชิ้น</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                {/* Pagination */}
                                {products.links && products.links.length > 3 && (
                                    <div className="mt-6 flex justify-center overflow-x-auto py-2">
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {products.links.map((link, i) => {
                                                const isUrlNull = !link.url;
                                                const className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium whitespace-nowrap transition-colors duration-300 ${link.active
                                                    ? 'z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    } ${isUrlNull ? 'cursor-not-allowed opacity-50' : ''}`;

                                                return isUrlNull ? (
                                                    <span
                                                        key={i}
                                                        className={className}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        className={className}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ProductList.layout = page => <MainLayout children={page} />;