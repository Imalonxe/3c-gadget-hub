import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import { Transition } from '@headlessui/react';
import { Menu } from '@headlessui/react';
import { motion } from 'framer-motion';
import PageTransition from '@/Components/PageTransition';
import { LuShoppingCart, LuUser, LuPackage, LuUsers, LuTicket, LuSun, LuMoon, LuPhone, LuTrophy } from 'react-icons/lu';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import ApplicationLogo from '@/Components/ApplicationLogo';
import useTheme from '@/Hooks/useTheme';

const AnimatedNavLink = ({ href, label, active, icon: Icon }) => (
    <Link
        href={href}
        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium group transition-colors duration-200 rounded-md ${active ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
    >
        <div className="flex items-center space-x-2">
            {Icon && (
                <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
                >
                    <Icon className="w-4 h-4" />
                </motion.div>
            )}
            <span>{label}</span>
        </div>
        {active && (
            <motion.span
                layoutId="nav-underline"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </Link>
);

const MainLayout = ({ children, flash = {}, fullWidth = false }) => {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = React.useState(false);
    const page = usePage();
    const auth = page.props.auth;
    const user = auth?.user;
    const { theme, toggleTheme } = useTheme();

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
            active: matchesRoute(['products.index', 'products.list']),
            icon: LuPackage
        },
        {
            label: 'Synergy Loadout',
            href: route('loadout.index'),
            active: matchesRoute(['loadout.*']),
            icon: LuPackage // Using Package icon for now as LuLightningBolt might not exist in react-icons/lu or I need to check import
        },
        {
            label: 'Coupons',
            href: route('coupons.index'),
            active: matchesRoute(['coupons.*']),
            icon: LuTicket
        },
        {
            label: 'Community',
            href: route('questions.index'),
            active: matchesRoute(['questions.*', 'community.*']),
            icon: LuUsers
        },
        {
            label: 'Contact Us',
            href: route('contact.index'),
            active: matchesRoute(['contact.*']),
            icon: LuPhone
        }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation Bar */}
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Left side - Logo and Main Nav */}
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ApplicationLogo className="h-10 w-auto" />
                                    </motion.div>
                                </Link>
                            </div>
                            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
                                {navItems.map((item) => (
                                    <AnimatedNavLink
                                        key={item.label}
                                        href={item.href}
                                        label={item.label}
                                        active={item.active}
                                        icon={item.icon}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right side - User menu (Desktop) */}
                        <div className="hidden sm:ml-6 sm:flex sm:items-center gap-2">
                            {/* Gamification Badge (Moved to be first in the group for better flow) */}
                            {user && (
                                <Link href={route('level-benefits.my-benefits')} className="mr-4">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100/50 dark:border-indigo-700/30 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-300 group"
                                    >
                                        <div className="relative">
                                            <LuTrophy className="w-4 h-4 text-amber-500 drop-shadow-sm" />
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-50"></div>
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition-colors">
                                                Level {user.level || 1}
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                {user.xp || 0} XP
                                            </span>
                                        </div>
                                    </motion.div>
                                </Link>
                            )}

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 focus:outline-none"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? (
                                    <LuSun className="h-5 w-5" />
                                ) : (
                                    <LuMoon className="h-5 w-5" />
                                )}
                            </button>

                            {/* Cart */}
                            <Link
                                href={route('cart.index')}
                                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                            >
                                <LuShoppingCart className="h-5 w-5" />
                                {/* Optional: Add badge for cart items count if available */}
                            </Link>

                            {/* Notifications */}
                            {user && (
                                <div className="relative">
                                    <NotificationsDropdown
                                        notifications={user.notifications}
                                        unreadCount={user.unread_notifications_count}
                                    />
                                </div>
                            )}

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <Menu as="div" className="ml-2 relative">
                                    <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-1 rounded-full border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 transition-all duration-200"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        </motion.div>
                                    </Menu.Button>

                                    <Transition
                                        enter="transition ease-out duration-200"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                    >
                                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700">
                                            <div className="px-4 py-3">
                                                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>
                                            <div className="py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('profile.edit')}
                                                            className={`${active ? 'bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} block px-4 py-2 text-sm transition-colors`}
                                                        >
                                                            Your Profile
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('user.orders')}
                                                            className={`${active ? 'bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} block px-4 py-2 text-sm transition-colors`}
                                                        >
                                                            Your Orders
                                                        </Link>
                                                    )}
                                                </Menu.Item>

                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('my-tickets.index')}
                                                            className={`${active ? 'bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} block px-4 py-2 text-sm transition-colors`}
                                                        >
                                                            My Tickets
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('wishlist.index')}
                                                            className={`${active ? 'bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} block px-4 py-2 text-sm transition-colors`}
                                                        >
                                                            My Wishlist
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <Link
                                                            href={route('coupons.all')}
                                                            className={`${active ? 'bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} block px-4 py-2 text-sm transition-colors`}
                                                        >
                                                            All Coupons
                                                        </Link>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                            <div className="py-1">
                                                {user.is_admin && (
                                                    <Menu.Item>
                                                        {({ active }) => (
                                                            <Link
                                                                href={route('admin.dashboard')}
                                                                className={`${active ? 'bg-gray-50 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'} block px-4 py-2 text-sm transition-colors`}
                                                            >
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                    </Menu.Item>
                                                )}
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <form method="POST" action={route('logout')}>
                                                            <input type="hidden" name="_token" value={(typeof document !== 'undefined' && document.querySelector('meta[name=\"csrf-token\"]')) ? document.querySelector('meta[name=\"csrf-token\"]').getAttribute('content') : ''} />
                                                            <button
                                                                type="submit"
                                                                className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'} block w-full text-left px-4 py-2 text-sm transition-colors`}
                                                            >
                                                                Sign out
                                                            </button>
                                                        </form>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            ) : (
                                <div className="flex items-center space-x-3 ml-4">
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm hover:shadow transition-all duration-200"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Hamburger */}
                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>

                    {/* Mobile Header: Level & Theme */}
                    <div className="pt-4 pb-2 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 mb-2">
                        {user ? (
                            <Link href={route('level-benefits.my-benefits')} className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                <div className="relative">
                                    <LuTrophy className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Level {user.level || 1}</p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400">{user.xp || 0} XP</p>
                                </div>
                            </Link>
                        ) : <div></div>}

                        <button
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {theme === 'dark' ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
                            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                        </button>
                    </div>

                    <div className="pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition duration-150 ease-in-out ${item.active
                                    ? 'border-indigo-400 text-indigo-700 bg-indigo-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Responsive Settings Options */}
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        {isAuthenticated ? (
                            <>
                                <div className="px-4">
                                    <div className="font-medium text-base text-gray-800">{user.name}</div>
                                    <div className="font-medium text-sm text-gray-500">{user.email}</div>
                                </div>

                                <div className="mt-3 space-y-1">
                                    <Link
                                        href={route('cart.index')}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                    >
                                        Cart
                                    </Link>
                                    <Link
                                        href={route('profile.edit')}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href={route('user.orders')}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                    >
                                        Orders
                                    </Link>
                                    <Link
                                        href={route('wishlist.index')}
                                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                    >
                                        Wishlist
                                    </Link>
                                    {user.is_admin && (
                                        <Link
                                            href={route('admin.dashboard')}
                                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <form method="POST" action={route('logout')}>
                                        <input type="hidden" name="_token" value={(typeof document !== 'undefined' && document.querySelector('meta[name=\"csrf-token\"]')) ? document.querySelector('meta[name=\"csrf-token\"]').getAttribute('content') : ''} />
                                        <button type="submit" className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
                                            Sign out
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 space-y-1">
                                <Link
                                    href={route('login')}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
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
            <main className={`flex-1 ${fullWidth ? '' : 'py-10'}`}>
                {fullWidth ? (
                    <PageTransition>
                        {children}
                    </PageTransition>
                ) : (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <Link href="/about" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <Link href="/faq" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shipping" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Shipping
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <Link href="/privacy" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Privacy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Terms
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Connect</h3>
                            <ul role="list" className="mt-4 space-y-4">
                                <li>
                                    <a href="https://facebook.com" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Facebook
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                        Instagram
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
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