import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children, wide = false, hideLogo = false }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-6 sm:justify-center sm:pt-0">
            {!hideLogo && (
                <div className="mb-4">
                    <Link href="/">
                        <ApplicationLogo className="h-28 w-auto" />
                    </Link>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`${hideLogo ? 'mt-0' : 'mt-2'} w-full overflow-hidden bg-white dark:bg-gray-800 px-8 py-8 shadow-xl ${wide ? 'sm:max-w-[980px] sm:rounded-2xl' : 'sm:max-w-lg sm:rounded-2xl'} border border-gray-100 dark:border-gray-700`}
            >
                {children}
            </motion.div>
        </div>
    );
}
