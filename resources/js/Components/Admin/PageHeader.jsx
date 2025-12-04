import React from 'react';
import { Link } from '@inertiajs/react';

export default function PageHeader({ title, breadcrumbs = [], actions = null }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                {breadcrumbs.length > 0 && (
                    <nav className="flex text-sm text-gray-500 mt-1">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index} className="flex items-center">
                                {index > 0 && <span className="mx-2">/</span>}
                                {crumb.href ? (
                                    <Link href={crumb.href} className="hover:text-indigo-600 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-700">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                    {actions}
                </div>
            )}
        </div>
    );
}
