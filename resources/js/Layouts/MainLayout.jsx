import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import { Transition } from '@headlessui/react';
import { Menu } from '@headlessui/react';
import PageTransition from '@/Components/PageTransition';
import { ShoppingCartIcon, UserIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';

const AnimatedNavLink = ({ href, label, active }) => (
    <Link
        href={href}
        className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium group transition-colors duration-200 ${
            active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {label}
        <span
            className={`absolute left-0 -bottom-1 h-0.5 bg-indigo-600 transition-all duration-300 ${
                active ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
        />
    </Link>
);

const MainLayout = ({ children, flash = {} }) => {
    const page = usePage();
    const auth = page.props.auth;
    const user = auth?.user;
    
    // Check if user is authenticated - user must exist
    const isAuthenticated = !!user;
    // Show any server flash messages (so backend flashes also show as toast)
    useEffect(() => {
        const f = page.props.flash || {};
        if (f.success) {
            toast.success(f.success);
        }
        if (f.error) {
            toast.error(f.error);
        }
    }, [page.props.flash]);
    
    const matchesRoute = (patterns = []) =>
        patterns.some((pattern) => {
            try {
                return route().current(pattern);
            } catch (e) {
                return false;
            }
        });

    const navItems = [
        {
            label: 'Products',
            href: route('products.index'),
            active: matchesRoute(['products.index', 'products.list'])
        },
        {
            label: 'Community',
            href: route('questions.index'),
            active: matchesRoute(['questions.*', 'community.*'])
        },
        {
            label: 'Coupons',
            href: route('coupons.index'),
            active: matchesRoute(['coupons.*'])
        }
    ];
    
    return (
    <div className="min-h-screen flex flex-col bg-gray-100">
            {/* Navigation Bar */}
            <nav className="bg-white/95 backdrop-blur shadow transition-shadow duration-300 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Left side - Logo and Main Nav */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="h-8 w-auto fill-current text-indigo-600" />
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navItems.map((item) => (
                                    <AnimatedNavLink
                                        key={item.label}
                                        href={item.href}
                                        label={item.label}
                                        active={item.active}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right side - User menu */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                            {/* Cart */}
                            <Link
                                href={route('cart.index')}
                                className="p-2 text-gray-400 hover:text-gray-500"
                            >
                                <ShoppingCartIcon className="h-6 w-6" />
                            </Link>

                            {/* Notifications */}
                            {user && (
                                <NotificationsDropdown
                                    notifications={user.notifications}
                                    unreadCount={user.unread_notifications_count}
                                />
                            )}

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <Menu as="div" className="ml-3 relative">
                                    <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <UserIcon className="h-6 w-6 text-gray-400" />
                                    </Menu.Button>

                                    <Transition
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <Menu.Item>
                                                <Link
                                                    href={route('profile.edit')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Your Profile
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Link
                                                    href={route('user.orders')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Your Orders
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Link
                                                    href={route('coupons.all')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    All Coupons
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item>
                                                <Link
                                                    href={route('wishlist.index')}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    My Wishlist
                                                </Link>
                                            </Menu.Item>
                                            {user.is_admin && (
                                                <Menu.Item>
                                                    <Link
                                                        href={route('admin.dashboard')}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                </Menu.Item>
                                            )}
                                            <Menu.Item>
                                                <form method="POST" action={route('logout')}>
                                                    <input type="hidden" name="_token" value={(typeof document !== 'undefined' && document.querySelector('meta[name=\"csrf-token\"]')) ? document.querySelector('meta[name=\"csrf-token\"]').getAttribute('content') : ''} />
                                                    <button type="submit" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
                                                </form>
                                            </Menu.Item>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={route('login')}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Flash Messages */}
            {flash.success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* react-hot-toast container (required for toast() to display) */}
            <Toaster />

            {/* Main Content */}
            <main className="flex-1 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <Link href="/faq" className="text-base text-gray-500 hover:text-gray-900">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shipping" className="text-base text-gray-500 hover:text-gray-900">
                                        Shipping
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                                        Terms
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <a href="https://facebook.com" className="text-base text-gray-500 hover:text-gray-900">
                                        Facebook
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com" className="text-base text-gray-500 hover:text-gray-900">
                                        Instagram
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 pt-8">
                        <p className="text-base text-gray-400 text-center">
                            &copy; 2025 3C Gadget Hub. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;