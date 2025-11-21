import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { HiMenu, HiX, HiHome, HiFolder, HiShoppingBag, HiClipboardList, HiTicket, HiUsers, HiQuestionMarkCircle, HiCreditCard } from 'react-icons/hi';

export default function AdminLayout({ children, title }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { auth, flash } = usePage().props;

    // Show backend flash messages (success / error) as toasts in the admin UI only.
    useEffect(() => {
        if (!flash) return;

        if (flash.success) {
            toast.success(flash.success);
        }

        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Safe Ziggy helpers: when a route name is missing from the Ziggy route list,
    // calling `route(name)` throws. Use these wrappers so the admin layout won't
    // crash if some admin routes are not registered in the current context.
    const safeRoute = (name, fallback = '#') => {
        try {
            return route(name);
        } catch (e) {
            // Log once to help debugging without spamming the console.
            // eslint-disable-next-line no-console
            console.warn(`Ziggy: missing route "${name}", falling back to ${fallback}`);
            return fallback;
        }
    };

    const isCurrent = (href) => {
        try {
            return route().current(href);
        } catch (e) {
            return false;
        }
    };

    const navigation = [
        { name: 'Dashboard', href: safeRoute('admin.dashboard'), icon: HiHome },
        { name: 'Categories', href: safeRoute('admin.categories.index'), icon: HiFolder },
        { name: 'Products', href: safeRoute('admin.products.index'), icon: HiShoppingBag },
        { name: 'Orders', href: safeRoute('admin.orders.index'), icon: HiClipboardList },
        { name: 'Coupons', href: safeRoute('admin.coupons.index'), icon: HiTicket },
        { name: 'Payment Settings', href: safeRoute('admin.payment.index'), icon: HiCreditCard },
    { name: 'Users', href: safeRoute('admin.users.index'), icon: HiUsers },
    { name: 'Questions', href: safeRoute('admin.questions.index'), icon: HiQuestionMarkCircle },
        { name: 'Activity Logs', href: safeRoute('admin.activity-logs.index'), icon: HiClipboardList },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-gray-900 to-gray-800">
                    <div className="flex items-center h-20 flex-shrink-0 px-6 bg-gray-900 border-b border-gray-700">
                        <ApplicationLogo className="block h-12 w-auto fill-current text-white" />
                        <div className="ml-3">
                            <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col overflow-y-auto py-6">
                        <nav className="flex-1 px-4 space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`${
                                        isCurrent(item.href)
                                            ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                                    } group flex items-center px-4 py-4 text-base font-medium rounded-lg transition-all duration-200`}
                                >
                                    {item.icon && (
                                        <item.icon className={`h-5 w-5 mr-3 ${isCurrent(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
                                    )}
                                    <span className="flex-1">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
                <div className="fixed inset-0 flex z-40">
                    <div
                        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
                            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    <div
                        className={`fixed inset-y-0 left-0 flex-1 flex flex-col max-w-xs w-full bg-gray-800 transform ease-in-out duration-300 ${
                            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <HiX className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-6 pb-6 border-b border-gray-700">
                                <ApplicationLogo className="block h-10 w-auto fill-current text-gray-200" />
                                <div className="ml-3">
                                    <h2 className="text-white font-bold text-base">Admin Panel</h2>
                                </div>
                            </div>
                            <nav className="mt-6 px-2 space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`${
                                            isCurrent(item.href)
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        } group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200`}
                                    >
                                        {item.icon && (
                                            <item.icon className={`h-5 w-5 mr-3 ${isCurrent(item.href) ? 'text-white' : 'text-gray-300'}`} />
                                        )}
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            {/* Toast container for admin backend flash messages */}
            <Toaster position="top-right" />
            <div className="md:pl-72">
                <div className="max-w-7xl mx-auto flex flex-col flex-1">
                    {/* Top bar */}
                    <div className="sticky top-4 z-10 flex-shrink-0 h-16 bg-white shadow-md border-b border-gray-200 mt-4">
                        <div className="flex justify-between items-center px-4 md:px-8 h-full">
                            <div className="flex items-center">
                                <button
                                    className="md:hidden -ml-0.5 h-12 w-12 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <HiMenu className="h-6 w-6" />
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900 ml-3 md:ml-0">
                                    {title}
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-base font-medium text-gray-700 hidden sm:inline">{auth.user.name}</span>
                                <form method="POST" action={route('logout')}>
                                    <input type="hidden" name="_token" value={(typeof document !== 'undefined' && document.querySelector('meta[name=\"csrf-token\"]')) ? document.querySelector('meta[name=\"csrf-token\"]').getAttribute('content') : ''} />
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Logout</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <main className="flex-1 bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}