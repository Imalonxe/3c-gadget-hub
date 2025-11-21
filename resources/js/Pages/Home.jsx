import React from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { motion } from 'framer-motion';
import ProductCard from '@/Components/ProductCard';

const Home = ({ auth, featuredProducts, categories }) => {
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 12, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } }
    };

    const hero = {
        hidden: { opacity: 0, y: -8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    };

    const categoryItem = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
        hover: { scale: 1.03 }
    };

    return (
        <MainLayout>
            <Head title="Welcome to 3C Gadget Hub" />

            {/* Hero Section */}
            <div className="relative" style={{ backgroundImage: 'none' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <motion.h1 variants={hero} initial="hidden" animate="visible" className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Your One-Stop Shop for</span>{' '}
                                    <span className="block text-indigo-600 xl:inline">3C Gadgets</span>
                                </motion.h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Discover the latest in Computer, Communication, and Consumer electronics. 
                                    Quality products with expert community support.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <a
                                            href={route('products.index')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                                        >
                                            Shop Now
                                        </a>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <a
                                            href={route('questions.index')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                                        >
                                            Join Community
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="bg-gray-100">
                <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Featured Products</h2>
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                    >
                        {featuredProducts.map((product, index) => (
                            <motion.div
                                key={product.product_id || product.id}
                                variants={item}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="h-full"
                            >
                                <ProductCard product={product} variant="featured" className="h-full" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-100">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-baseline sm:justify-between">
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Shop by Category</h2>
                        <a href={route('products.index')} className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
                            Browse all categories<span aria-hidden="true"> &rarr;</span>
                        </a>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }}
                        className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8"
                    >
                        {categories.slice(0, 4).map((category, index) => (
                            <motion.a
                                key={category.category_id}
                                href={route('products.list', { category: category.slug })}
                                variants={categoryItem}
                                whileHover="hover"
                                className="group relative rounded-lg overflow-hidden sm:row-span-2 h-64 md:h-72 lg:h-80 cursor-pointer"
                            >
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

                                {/* Gradient overlay to improve text contrast; animate opacity on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-90" />

                                {/* Content */}
                                <div className="absolute left-4 right-4 bottom-4">
                                    <div className="inline-block bg-black/60 backdrop-blur-sm text-white rounded-md px-3 py-2 shadow-lg transition-transform duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        <h3 className="text-lg font-semibold leading-tight">{category.category_name}</h3>
                                        <p className="text-sm opacity-90">Shop now</p>
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </motion.div>

                    <div className="mt-6 sm:hidden">
                        <a href={route('products.index')} className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                            Browse all categories<span aria-hidden="true"> &rarr;</span>
                        </a>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Home;