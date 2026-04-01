import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ProductCard from '@/Components/ProductCard';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from 'use-debounce';

export default function Index({ products, categories, selectedCategory, filters }) {
    const { url } = usePage();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Handle search when debounced term changes
    useEffect(() => {
        if (debouncedSearchTerm !== (filters.search || '')) {
            router.get(
                route('products.index'),
                {
                    search: debouncedSearchTerm,
                    category: selectedCategory ? categories.find(c => c.category_id === selectedCategory)?.slug : undefined
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                }
            );
        }
    }, [debouncedSearchTerm]);

    const clearSearch = () => {
        setSearchTerm('');
    };

    // Filter categories logic
    const topLevel = categories.filter(c => !c.parent_category_id);
    const parentCategories = topLevel.filter(tc => tc.is_parent === true || tc.is_parent === 1);
    const otherCategories = topLevel.filter(tc => !tc.is_parent || tc.is_parent === false || tc.is_parent === 0);

    return (
        <>
            <Head title="Products" />

            <div className="py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header & Search Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Our Products</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Explore our wide range of premium gadgets</p>
                        </div>

                        <div className={`relative w-full md:w-96 transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-indigo-500 rounded-lg' : ''}`}>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-10 py-2.5 border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:border-indigo-500 focus:ring-0 sm:text-sm shadow-sm transition-all duration-300"
                                placeholder="Search products, brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories - Compact Horizontal Scroll on Mobile, Grid on Desktop */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Categories</h2>
                            {selectedCategory && (
                                <Link href={route('products.index')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors duration-300">
                                    View All Categories
                                </Link>
                            )}
                        </div>

                        <div className="relative">
                            <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar snap-x">
                                {/* All Products Pill */}
                                <Link
                                    href={route('products.index')}
                                    className={`snap-start flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full border transition-all duration-200 ${!selectedCategory
                                        ? 'bg-indigo-600 text-white border-transparent shadow-md'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                                        }`}
                                >
                                    All Products
                                </Link>

                                {parentCategories.map((category) => (
                                    <Link
                                        key={category.category_id}
                                        href={route('products.index', { category: category.slug })}
                                        className={`snap-start flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full border transition-all duration-200 ${selectedCategory === category.category_id
                                            ? 'bg-indigo-600 text-white border-transparent shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        {category.category_name}
                                    </Link>
                                ))}

                                {otherCategories.map((category) => (
                                    <Link
                                        key={category.category_id}
                                        href={route('products.index', { category: category.slug })}
                                        className={`snap-start flex-shrink-0 inline-flex items-center px-4 py-2 rounded-full border transition-all duration-200 ${selectedCategory === category.category_id
                                            ? 'bg-indigo-600 text-white border-transparent shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        {category.category_name}
                                    </Link>
                                ))}
                            </div>
                            {/* Gradient fade for horizontal scroll indication */}
                            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none md:hidden transition-colors duration-300" />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px] transition-colors duration-300">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 transition-colors duration-300">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                                    {searchTerm ? `Search Results for "${searchTerm}"` : (
                                        selectedCategory
                                            ? categories.find(c => c.category_id === selectedCategory)?.category_name
                                            : 'All Products'
                                    )}
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full transition-colors duration-300">
                                    {products.total} items
                                </span>
                            </div>

                            {products.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 transition-colors duration-300">
                                        <MagnifyingGlassIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-300">No products found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 transition-colors duration-300">
                                        We couldn't find any products matching your search. Try adjusting your keywords or filters.
                                    </p>
                                    <button
                                        onClick={clearSearch}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="mt-10 flex justify-center">
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {products.links.map((link, i) => {
                                            const isDisabled = !link.url;
                                            const isPrevious = link.label.includes('Previous');
                                            const isNext = link.label.includes('Next');

                                            let classes = "relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ";

                                            if (link.active) {
                                                classes += "z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400";
                                            } else {
                                                classes += "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700";
                                            }

                                            if (isDisabled) {
                                                classes += " cursor-not-allowed opacity-60";
                                            }

                                            if (i === 0) classes += " rounded-l-md";
                                            if (i === products.links.length - 1) classes += " rounded-r-md";

                                            return (
                                                <Link
                                                    key={i}
                                                    href={isDisabled ? undefined : link.url}
                                                    onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                                                    className={classes}
                                                    dangerouslySetInnerHTML={{
                                                        __html: isPrevious ? '<span class="sr-only">Previous</span><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>'
                                                            : (isNext ? '<span class="sr-only">Next</span><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>'
                                                                : link.label)
                                                    }}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = page => <MainLayout children={page} />;