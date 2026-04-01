import React from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Show({ log }) {
    return (
        <>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Activity Log #{log.id}</h2>

                <div className="bg-white p-4 rounded shadow">
                    <p><strong>User:</strong> {log.user ? log.user.name : 'Guest'}</p>
                    <p><strong>Action:</strong> {log.action}</p>
                    <p><strong>URL:</strong> {log.url}</p>
                    <p><strong>Method:</strong> {log.method}</p>
                    <p><strong>IP:</strong> {log.ip_address}</p>
                    <p><strong>User agent:</strong> {log.user_agent}</p>
                    <p><strong>When:</strong> {new Date(log.created_at).toLocaleString()}</p>

                    <div className="mt-4">
                        <h3 className="font-medium">Meta</h3>
                        <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto">{JSON.stringify(log.meta, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = page => <Layout children={page} />;
