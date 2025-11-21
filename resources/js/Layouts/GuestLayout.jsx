import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, wide = false, hideLogo = false }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 pt-6 sm:justify-center sm:pt-0">
            {!hideLogo && (
                <div className="mb-4">
                <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-600 hover:text-gray-800 transition-colors" />
                </Link>
            </div>
            )}

            <div className={`${hideLogo ? 'mt-0' : 'mt-2'} w-full overflow-hidden bg-white px-8 py-8 shadow-xl ${wide ? 'sm:max-w-[980px] sm:rounded-2xl' : 'sm:max-w-lg sm:rounded-2xl'} border border-gray-100`}>
                {children}
            </div>
        </div>
    );
}
