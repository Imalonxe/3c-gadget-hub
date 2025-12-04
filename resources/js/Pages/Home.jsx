import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { motion } from 'framer-motion';
import ProductCard from '@/Components/ProductCard';
import { HiTruck, HiShieldCheck, HiSupport, HiCurrencyDollar } from 'react-icons/hi';
import AnnouncementPopup from '@/Components/AnnouncementPopup';

const Home = ({ auth, featuredProducts, categories, announcement }) => {
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
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const heroText = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
    };

    const blobVariants = {
        animate: {
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            transition: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    return (
        <MainLayout fullWidth={true}>
            <Head title="Welcome to 3C Gadget Hub" />

            <AnnouncementPopup announcement={announcement} />

            {/* Hero Section with Animated Background */}
            <div className="relative overflow-hidden bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                {/* Animated Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        variants={blobVariants}
                        animate="animate"
                        className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10"
                    />
                    <motion.div
                        variants={blobVariants}
                        animate="animate"
                        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 dark:bg-cyan-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10"
                    />
                    <motion.div
                        variants={blobVariants}
                        animate="animate"
                        transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 4 }}
                        className="absolute -bottom-24 left-20 w-96 h-96 bg-teal-400 dark:bg-teal-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10"
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-40 lg:py-52 flex items-center justify-center min-h-96 md:min-h-[550px]">
                    <div className="text-center">
                        <motion.h1
                            variants={heroText}
                            initial="hidden"
                            animate="visible"
                            className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight transition-colors duration-300"
                        >
                            <span className="block">Your One-Stop Shop for</span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
                                3C Gadgets
                            </span>
                        </motion.h1>
                        <motion.p
                            variants={heroText}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                            className="mt-5 max-w-2xl mx-auto text-base text-slate-600 dark:text-gray-300 sm:text-lg md:mt-6 md:text-xl md:max-w-4xl leading-relaxed transition-colors duration-300"
                        >
                            Discover the latest in Computer, Communication, and Consumer electronics.
                            Premium quality products with expert community support.
                        </motion.p>
                        <motion.div
                            variants={heroText}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                            className="mt-6 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 gap-4"
                        >
                            <div className="rounded-md shadow-lg">
                                <Link
                                    href={route('products.index')}
                                    className="group relative w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-md text-white overflow-hidden md:py-4 md:text-lg md:px-12 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl whitespace-nowrap"
                                >
                                    {/* Animated gradient background */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-[length:200%_100%] animate-gradient"></span>
                                    {/* Shine effect on hover */}
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 animate-shine"></span>
                                    </span>
                                    <span className="relative z-10 flex items-center gap-2">
                                        Shop Now
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                            <div className="mt-3 rounded-md shadow-lg sm:mt-0 sm:ml-0">
                                <Link
                                    href={route('questions.index')}
                                    className="group relative w-full flex items-center justify-center px-8 py-3 border-2 border-blue-600 dark:border-blue-400 text-base font-semibold rounded-md text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 overflow-hidden md:py-4 md:text-lg md:px-12 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl whitespace-nowrap"
                                >
                                    {/* Hover background fill effect */}
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                                    {/* Pulse effect */}
                                    <span className="absolute inset-0 rounded-md border-2 border-blue-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></span>
                                    <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                                        Join Community
                                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-slate-50 dark:bg-gray-900 py-16 sm:py-24 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Why Choose Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl transition-colors duration-300">
                            Better Technology, Better Life
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: HiTruck, title: 'Fast Shipping', desc: 'Free delivery on all orders over $100' },
                                { icon: HiShieldCheck, title: 'Secure Payment', desc: '100% secure payment with Stripe & PromptPay' },
                                { icon: HiSupport, title: '24/7 Support', desc: 'Dedicated support team ready to help' },
                                { icon: HiCurrencyDollar, title: 'Best Price', desc: 'Guaranteed best prices for genuine products' },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                                        <feature.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white transition-colors duration-300">{feature.title}</h3>
                                    <p className="mt-2 text-base text-slate-500 dark:text-gray-400 transition-colors duration-300">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <div className="bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-300">Featured Products</h2>
                            <p className="mt-2 text-slate-500 dark:text-gray-400 transition-colors duration-300">Hand-picked selection just for you</p>
                        </div>
                        <Link href={route('products.index')} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium flex items-center transition-colors duration-300">
                            View all <span className="ml-1">&rarr;</span>
                        </Link>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                    >
                        {featuredProducts.map((product) => (
                            <motion.div
                                key={product.product_id || product.id}
                                variants={item}
                                className="h-full"
                            >
                                <ProductCard product={product} variant="featured" className="h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-baseline sm:justify-between mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-300">Shop by Category</h2>
                        <Link href={route('products.index')} className="hidden text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 sm:block transition-colors duration-300">
                            Browse all categories<span aria-hidden="true"> &rarr;</span>
                        </Link>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                    >
                        {categories.filter(c => c.is_featured).slice(0, 4).map((category, index) => (
                            <motion.div
                                key={category.category_id}
                                variants={item}
                                className="group relative rounded-lg overflow-hidden cursor-pointer h-96"
                            >
                                <Link href={`${route('products.list')}?category=${category.slug}`} className="block w-full h-full">
                                    <div className="absolute inset-0">
                                        <img
                                            src={category.image_url || '/images/placeholder.jpg'}
                                            alt={category.category_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.jpg';
                                                e.target.className = 'w-full h-full object-contain bg-slate-100 p-4';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 p-6">
                                        <h3 className="text-xl font-bold text-white tracking-wide">{category.category_name}</h3>
                                        <p className="mt-1 text-sm text-slate-200">Explore Collection</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="mt-6 sm:hidden">
                        <Link href={route('products.index')} className="block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors duration-300">
                            Browse all categories<span aria-hidden="true"> &rarr;</span>
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Home;