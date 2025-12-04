import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { motion } from 'framer-motion';
import { Squares2X2Icon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Categories({ categories, selectedCategory }) {
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    };

    const categoryItem = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
        hover: { scale: 1.03 }
    };

    return (
        <>
            <Head title="Product Categories" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Categories</h2>

                        {/* All Products Card at the top */}
                        <div className="mb-8">
                            <Link
                                href={route('products.list')}
                                className="group block w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                            >
                                <div className="px-8 py-10 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors duration-300">
                                            <Squares2X2Icon className="w-8 h-8 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">All Products</h3>
                                            <p className="text-gray-500 dark:text-gray-400">Browse our complete collection of gadgets and gear</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 text-gray-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300">
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Categories Grid */}
                        {
                            (() => {
                                // Show only top-level categories by default (no parent)
                                const topLevel = categories.filter(c => !c.parent_category_id);

                                // If a selectedCategory is present and corresponds to a top-level category that has children,
                                // show the children instead (same layout as categories grid)
                                const currentCategory = selectedCategory ? categories.find(c => c.slug === selectedCategory) : null;
                                const childCategories = currentCategory ? categories.filter(c => String(c.parent_category_id) === String(currentCategory.category_id)) : [];

                                // If children exist for this selected category, render them and link to product list when a child is clicked
                                if (currentCategory && childCategories.length > 0) {
                                    return (
                                        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
                                            {childCategories.map((category) => (
                                                <motion.div
                                                    key={category.category_id}
                                                    variants={categoryItem}
                                                    whileHover="hover"
                                                    className="group relative rounded-lg overflow-hidden sm:row-span-2 h-64 md:h-72 lg:h-80 cursor-pointer"
                                                >
                                                    <Link href={route('products.list', { category: category.slug })}>
                                                        <motion.img
                                                            src={category.image_url || '/images/placeholder.jpg'}
                                                            alt={category.category_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder.jpg';
                                                                e.target.className = 'w-full h-full object-contain bg-gray-200';
                                                            }}
                                                            whileHover={{ scale: 1.05 }}
                                                            transition={{ duration: 0.35 }}
                                                        />

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

                                                        <div className="absolute left-4 right-4 bottom-4">
                                                            <div className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                                <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                                                <p className="text-sm opacity-90">Shop products</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    );
                                }

                                // Otherwise render top-level parents first and other top-level categories under "Other Categories"
                                const parentCategories = topLevel.filter(tc => categories.some(child => String(child.parent_category_id) === String(tc.category_id)));
                                const otherCategories = topLevel.filter(tc => !categories.some(child => String(child.parent_category_id) === String(tc.category_id)));

                                return (
                                    <>
                                        <motion.div variants={container} initial="hidden" animate="visible" className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
                                            {parentCategories.map((category) => (
                                                <motion.div
                                                    key={category.category_id}
                                                    variants={categoryItem}
                                                    whileHover="hover"
                                                    className="group relative rounded-lg overflow-hidden sm:row-span-2 h-64 md:h-72 lg:h-80 cursor-pointer"
                                                >
                                                    <Link href={route('products.index', { category: category.slug })}>
                                                        <motion.img
                                                            src={category.image_url || '/images/placeholder.jpg'}
                                                            alt={category.category_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.src = '/images/placeholder.jpg';
                                                                e.target.className = 'w-full h-full object-contain bg-gray-200';
                                                            }}
                                                            whileHover={{ scale: 1.05 }}
                                                            transition={{ duration: 0.35 }}
                                                        />

                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

                                                        <div className="absolute left-4 right-4 bottom-4">
                                                            <div
                                                                className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-black/70"
                                                            >
                                                                <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                                                <p className="text-sm opacity-90">Go now</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </motion.div>

                                        {otherCategories.length > 0 && (
                                            <div className="col-span-full mt-6">
                                                <div className="flex items-center">
                                                    <div className="flex-1 h-px bg-gray-200" />
                                                    <div className="px-4 text-sm text-gray-500">Other Categories</div>
                                                    <div className="flex-1 h-px bg-gray-200" />
                                                </div>

                                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                                                    {otherCategories.map((category) => (
                                                        <motion.div
                                                            key={category.category_id}
                                                            variants={categoryItem}
                                                            whileHover="hover"
                                                            className="group relative rounded-lg overflow-hidden h-48 md:h-56 lg:h-60 cursor-pointer"
                                                        >
                                                            <Link href={route('products.list', { category: category.slug })}>
                                                                <motion.img
                                                                    src={category.image_url || '/images/placeholder.jpg'}
                                                                    alt={category.category_name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = '/images/placeholder.jpg';
                                                                        e.target.className = 'w-full h-full object-contain bg-gray-200';
                                                                    }}
                                                                    whileHover={{ scale: 1.03 }}
                                                                    transition={{ duration: 0.35 }}
                                                                />

                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

                                                                <div className="absolute left-4 right-4 bottom-4">
                                                                    <div
                                                                        className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0 hover:bg-black/70"
                                                                    >
                                                                        <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                                                        <p className="text-sm opacity-90">Go now</p>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        </motion.div>
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
            </div>
        </>
    );
}

Categories.layout = page => <MainLayout children={page} />;