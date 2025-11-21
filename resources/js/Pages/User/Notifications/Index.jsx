import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';

export default function Index({ notifications }) {
    return (
        <AppLayout>
            <Head title="Notifications" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                            <div className="mt-4 divide-y">
                                {notifications.data && notifications.data.length > 0 ? (
                                    notifications.data.map((n) => (
                                        <div key={n.id} className={`py-3 ${!n.read_at ? 'bg-blue-50' : ''}`}>
                                            <Link href={n.data?.url || '#'} className="block">
                                                <p className="text-sm text-gray-900">{n.data.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{format(new Date(n.created_at), 'PPp')}</p>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">You have no notifications.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
