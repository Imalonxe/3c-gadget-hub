import React from 'react';
import { Link } from '@inertiajs/react';
import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
    title = 'No items found',
    description = 'Get started by creating a new item.',
    actionLabel,
    actionUrl,
    icon: Icon = InboxIcon
}) {
    return (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {actionLabel && actionUrl && (
                <div className="mt-6">
                    <Link
                        href={actionUrl}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {actionLabel}
                    </Link>
                </div>
            )}
        </div>
    );
}
