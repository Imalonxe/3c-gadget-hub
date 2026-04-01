import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'react-hot-toast';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PageTransition from '@/Components/PageTransition';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    FolderIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    TicketIcon,
    UsersIcon,
    QuestionMarkCircleIcon,
    CreditCardIcon,
    TruckIcon,
    CircleStackIcon,
    BoltIcon,
    ChartBarIcon,
    LifebuoyIcon,
    StarIcon,
    MegaphoneIcon
} from '@heroicons/react/24/outline';

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
        {
            title: 'Dashboard',
            items: [
                { name: 'Dashboard', href: safeRoute('admin.dashboard'), icon: HomeIcon },
                { name: 'Mission Analytics', href: safeRoute('admin.analytics'), icon: ChartBarIcon },
            ]
        },
        {
            title: 'Core Features',
            items: [
                { name: 'Orders', href: safeRoute('admin.orders.index'), icon: ClipboardDocumentListIcon },
                { name: 'Products', href: safeRoute('admin.products.index'), icon: ShoppingBagIcon },
                { name: 'Categories', href: safeRoute('admin.categories.index'), icon: FolderIcon },
                { name: 'Users', href: safeRoute('admin.users.index'), icon: UsersIcon },
            ]
        },
        {
            title: 'Operations',
            items: [
                { name: 'Payment Settings', href: safeRoute('admin.payment.index'), icon: CreditCardIcon },
                { name: 'Coupons', href: safeRoute('admin.coupons.index'), icon: TicketIcon },
                { name: 'Shipping Providers', href: safeRoute('admin.shipping-providers.index'), icon: TruckIcon },
                { name: 'Missions', href: safeRoute('admin.missions.index'), icon: BoltIcon },
                { name: 'Level Benefits', href: safeRoute('admin.level-benefits.index'), icon: StarIcon },
                { name: 'Announcements', href: safeRoute('admin.announcements.index'), icon: MegaphoneIcon },
            ]
        },
        {
            title: 'System Settings',
            items: [
                { name: 'Activity Logs', href: safeRoute('admin.activity-logs.index'), icon: ClipboardDocumentListIcon },
                { name: 'Database Backups', href: safeRoute('admin.backups.index'), icon: CircleStackIcon },
            ]
        },
        {
            title: 'Support / Other',
            items: [
                { name: 'Support Tickets', href: safeRoute('admin.tickets.index'), icon: LifebuoyIcon },
                { name: 'Questions', href: safeRoute('admin.questions.index'), icon: QuestionMarkCircleIcon },
            ]
        }
    ];

    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Check if any child is active to auto-open menu
    useEffect(() => {
        navigation.forEach(section => {
            section.items.forEach(item => {
                if (item.children) {
                    const hasActiveChild = item.children.some(child => isCurrent(child.href));
                    if (hasActiveChild) {
                        setOpenMenus(prev => ({ ...prev, [item.name]: true }));
                    }
                }
            });
        });
    }, []);

    const renderNavItem = (item) => (
        <div key={item.name}>
            {item.children ? (
                <>
                    <button
                        onClick={() => toggleMenu(item.name)}
                        className={`w-full group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${item.children.some(child => isCurrent(child.href))
                            ? 'text-white bg-gray-800'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center">
                            {item.icon && (
                                <item.icon className={`h-5 w-5 mr-3 ${item.children.some(child => isCurrent(child.href))
                                    ? 'text-white'
                                    : 'text-gray-300 group-hover:text-white'
                                    }`} />
                            )}
                            <span>{item.name}</span>
                        </div>
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${openMenus[item.name] ? 'transform rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {openMenus[item.name] && (
                        <div className="mt-1 space-y-1 pl-11">
                            {item.children.map((child) => (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className={`${isCurrent(child.href)
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                        } group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <Link
                    href={item.href}
                    className={`${isCurrent(item.href)
                        ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                        } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200`}
                >
                    {item.icon && (
                        <item.icon className={`h-5 w-5 mr-3 ${isCurrent(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
                    )}
                    <span className="flex-1">{item.name}</span>
                </Link>
            )}
        </div>
    );

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
                    <div className="flex-1 flex flex-col overflow-y-auto py-6 admin-sidebar-scroll">
                        <style>{`
                            .admin-sidebar-scroll::-webkit-scrollbar {
                                width: 5px;
                            }
                            .admin-sidebar-scroll::-webkit-scrollbar-track {
                                background: transparent;
                            }
                            .admin-sidebar-scroll::-webkit-scrollbar-thumb {
                                background-color: #374151;
                                border-radius: 20px;
                            }
                            .admin-sidebar-scroll::-webkit-scrollbar-thumb:hover {
                                background-color: #4b5563;
                                }
                        `}</style>
                        <nav className="flex-1 px-4 space-y-6">
                            {navigation.map((section, index) => (
                                <div key={index}>
                                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        {section.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {section.items.map(renderNavItem)}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
                <div className={`fixed inset-0 flex z-40 ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
                    <div
                        className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        onClick={() => setIsSidebarOpen(false)}
                    />

                    <div
                        className={`fixed inset-y-0 left-0 flex-1 flex flex-col max-w-xs w-full bg-gray-800 transform ease-in-out duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                    >
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <XMarkIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-6 pb-6 border-b border-gray-700">
                                <ApplicationLogo className="block h-10 w-auto fill-current text-gray-200" />
                                <div className="ml-3">
                                    <h2 className="text-white font-bold text-base">Admin Panel</h2>
                                </div>
                            </div>
                            <nav className="mt-6 px-2 space-y-6">
                                {navigation.map((section, index) => (
                                    <div key={index}>
                                        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            {section.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {section.items.map(renderNavItem)}
                                        </div>
                                    </div>
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
                <div className="flex flex-col flex-1 w-full">
                    {/* Top bar */}
                    <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white shadow-md border-b border-gray-200">
                        <div className="flex justify-between items-center px-4 md:px-8 h-full">
                            <div className="flex items-center">
                                <button
                                    className="md:hidden -ml-0.5 h-12 w-12 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <Bars3Icon className="h-6 w-6" />
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
                        <PageTransition key={usePage().url}>
                            {children}
                        </PageTransition>
                    </main>
                </div>
            </div>
        </div>
    );
}