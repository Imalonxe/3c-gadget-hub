import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ProductCard from '@/Components/ProductCard';

export default function Index({ products, categories, selectedCategory, auth }) {
    return (
        <MainLayout>
            <Head title="Products" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Categories Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Categories</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* All Products Card */}
                            <a
                                href={route('products.index')}
                                className={`group relative rounded-lg overflow-hidden h-64 md:h-72 lg:h-80 ${
                                    !selectedCategory ? 'ring-2 ring-indigo-500' : ''
                                }`}
                            >
                                <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                                    <div className="text-center px-6">
                                        <h3 className="text-3xl md:text-4xl font-extrabold text-white">All Products</h3>
                                        <p className="text-white/90 mt-2">Browse our complete collection</p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent pointer-events-none" />
                            </a>

                            {/* Category Cards */}
                            {
                                (() => {
                                    // Work only with top-level categories (those without a parent)
                                    const topLevel = categories.filter(c => !c.parent_category_id);

                                    // Among top-level, parents are those that have children (some other category references them)
                                    const parentCategories = topLevel.filter(tc => categories.some(child => String(child.parent_category_id) === String(tc.category_id)));

                                    // Top-level categories that are not parents (no children)
                                    const otherCategories = topLevel.filter(tc => !categories.some(child => String(child.parent_category_id) === String(tc.category_id)));

                                    return (
                                        <>
                                            {parentCategories.map((category) => (
                                                <a
                                                    key={category.category_id}
                                                    href={route('products.index', { category: category.slug })}
                                                    className={`group relative rounded-lg overflow-hidden h-64 md:h-72 lg:h-80 ${
                                                        selectedCategory === category.category_id ? 'ring-2 ring-indigo-500' : ''
                                                    }`}
                                                >
                                                    <div
                                                        className="w-full h-full bg-gray-100 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                                                        style={{ backgroundImage: `url(${category.image_url || '/images/placeholder.jpg'})` }}
                                                        role="img"
                                                        aria-label={category.category_name}
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

                                                    <div className="absolute left-4 right-4 bottom-4">
                                                        <a
                                                            href={route('products.index', { category: category.slug })}
                                                            className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-black/70"
                                                        >
                                                            <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                                            <p className="text-sm opacity-90">Go now</p>
                                                        </a>
                                                    </div>
                                                </a>
                                            ))}

                                            {otherCategories.length > 0 && (
                                                <div className="col-span-full mt-6">
                                                    <div className="flex items-center">
                                                        <div className="flex-1 h-px bg-gray-200" />
                                                        <div className="px-4 text-sm text-gray-500">Other Categories</div>
                                                        <div className="flex-1 h-px bg-gray-200" />
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                                                        {otherCategories.map((category) => (
                                                            <a
                                                                key={category.category_id}
                                                                href={route('products.index', { category: category.slug })}
                                                                className={`group relative rounded-lg overflow-hidden h-48 md:h-56 lg:h-60 ${
                                                                    selectedCategory === category.category_id ? 'ring-2 ring-indigo-500' : ''
                                                                }`}
                                                            >
                                                                <div
                                                                    className="w-full h-full bg-gray-100 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                                                                    style={{ backgroundImage: `url(${category.image_url || '/images/placeholder.jpg'})` }}
                                                                    role="img"
                                                                    aria-label={category.category_name}
                                                                />

                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

                                                                <div className="absolute left-4 right-4 bottom-4">
                                                                    <a
                                                                        href={route('products.index', { category: category.slug })}
                                                                        className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-black/70"
                                                                    >
                                                                        <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                                                        <p className="text-sm opacity-90">Go now</p>
                                                                    </a>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()
                            }
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {selectedCategory 
                                        ? `${categories.find(c => c.category_id === selectedCategory)?.category_name || 'Products'}`
                                        : 'All Products'
                                    }
                                </h2>
                                <span className="text-gray-500 text-sm">{products.total} products</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
                                        {products.links.map((link, i) => {
                                            const isDisabled = !link.url;
                                            const baseClasses = `relative inline-flex items-center px-3 md:px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-150`;
                                            const stateClasses = link.active
                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';

                                            return (
                                                <a
                                                    key={i}
                                                    href={isDisabled ? undefined : link.url}
                                                    onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                                                    className={`${baseClasses} ${stateClasses} ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-sm'} mx-1`}
                                                    aria-disabled={isDisabled}
                                                    aria-current={link.active ? 'page' : undefined}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
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
        </MainLayout>
    );
}